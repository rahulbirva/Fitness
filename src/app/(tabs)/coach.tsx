import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { getStoredItem } from '../../utils/storage';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { Typography } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { ChatBubble } from '../../components/coach/ChatBubble';
import { getProfile, Profile } from '../../db/queries/profile';
import {
  getMessagesForSession,
  saveMessage,
  clearChatHistory,
  ChatMessage,
} from '../../db/queries/chatMessages';
import { getLast7DaysLogs } from '../../db/queries/workoutLogs';
import { getWaterForDate } from '../../db/queries/waterLogs';
import { getMealLogsForDate } from '../../db/queries/mealLogs';
import { getWorkoutForDate } from '../../utils/schedule';
import { todayDateString } from '../../utils/date';
import { askAICoach } from '../../services/ai';
import { AIMessage } from '../../services/ai/types';
import { DIET_RULES } from '../../constants/dietData';

export default function CoachScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [activeApiKey, setActiveApiKey] = useState('');

  const scrollRef = useRef<any>(null);
  const todayStr = todayDateString();

  const loadCoachSession = useCallback(async () => {
    try {
      const p = await getProfile();
      setProfile(p);

      const msgs = await getMessagesForSession('main', 100);
      setMessages(msgs);

      if (p?.ai_provider) {
        let key = await getStoredItem(`api_key_${p.ai_provider}`);
        if (!key || !key.trim()) {
          const envKey =
            p.ai_provider === 'gemini'
              ? process.env.EXPO_PUBLIC_GEMINI_API_KEY
              : process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
          if (envKey && envKey.trim()) {
            key = envKey.trim();
          }
        }
        setHasApiKey(Boolean(key && key.trim()));
        setActiveApiKey(key?.trim() || '');
      }
    } catch (err) {
      console.error('Error loading coach session:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCoachSession();
    }, [loadCoachSession])
  );

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, streamBuffer]);

  const assembleUserContext = async (userProfile: Profile | null): Promise<string> => {
    const todayWorkout = userProfile?.program_start_date
      ? getWorkoutForDate(userProfile.program_start_date, todayStr)
      : null;

    const last7Logs = await getLast7DaysLogs();
    const waterGlasses = await getWaterForDate(todayStr);
    const todayMeals = await getMealLogsForDate(todayStr);

    const workoutText = todayWorkout
      ? `Today is Day ${todayWorkout.dayNumber} (${todayWorkout.title}): ${todayWorkout.exercises.map((e) => e.name).join(', ')}`
      : 'No active workout for today.';

    const logsSummary = last7Logs.length > 0
      ? last7Logs.map((l) => `${l.date}: Day ${l.day_number} (${l.completed ? 'COMPLETED' : 'INCOMPLETE'})`).join('; ')
      : 'No workout history logged in the last 7 days yet.';

    const mealsSummary = todayMeals.length > 0
      ? todayMeals.map((m) => `${m.slot}: ${m.meal_name} [${m.completed ? 'EATEN' : 'PLANNED'}]`).join(', ')
      : 'No meals logged yet today.';

    return `
User Profile:
- Name: ${userProfile?.name || 'User'}
- Age: ${userProfile?.age}
- Height: ${userProfile?.height_cm} cm
- Weight: ${userProfile?.weight_kg} kg
- Sex: ${userProfile?.sex}
- Goal: ${userProfile?.goal}
- Wedding Date: ${userProfile?.wedding_date || '30 days out'}
- Water intake today: ${(waterGlasses * 250) / 1000} L (target 3.5 L)

Today's Workout:
${workoutText}

Last 7 Days Training Logs:
${logsSummary}

Today's Nutrition Logs:
${mealsSummary}

Plan Rules Reference:
${DIET_RULES.slice(0, 5).join('; ')}
`.trim();
  };

  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text || isStreaming) return;

    if (!hasApiKey || !activeApiKey) {
      Alert.alert(
        'API Key Required',
        'Please enter your Claude or Gemini API key in the Settings tab to chat with your coach.',
        [
          { text: 'Go to Settings', onPress: () => router.push('/(tabs)/settings') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    setInputText('');
    const tempUserId = Date.now();
    const newMsg: ChatMessage = {
      id: tempUserId,
      session_id: 'main',
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    await saveMessage('main', 'user', text);

    setIsStreaming(true);
    setStreamBuffer('');

    try {
      const userContext = await assembleUserContext(profile);

      // Convert messages to AIMessage format
      const history: AIMessage[] = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      history.push({ role: 'user', content: text });

      let accumulated = '';

      await askAICoach(
        profile?.ai_provider || 'gemini',
        activeApiKey,
        profile?.ai_model || 'gemini-1.5-flash',
        history,
        userContext,
        (chunk) => {
          if (!chunk.done) {
            accumulated += chunk.text;
            setStreamBuffer(accumulated);
          } else {
            // Streaming finished
            setIsStreaming(false);
            setStreamBuffer('');
            const assistantMsg: ChatMessage = {
              id: Date.now() + 1,
              session_id: 'main',
              role: 'assistant',
              content: accumulated,
              created_at: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, assistantMsg]);
            saveMessage('main', 'assistant', accumulated);
          }
        }
      );
    } catch (err: unknown) {
      setIsStreaming(false);
      setStreamBuffer('');
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Failed to communicate with AI Coach. Check network and API key in Settings.';

      const errReply: ChatMessage = {
        id: Date.now() + 2,
        session_id: 'main',
        role: 'assistant',
        content: `Error: ${errorMsg}`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errReply]);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Conversation',
      'Are you sure you want to clear your chat history with the coach?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearChatHistory('main');
            setMessages([]);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Typography variant="captionBold" color={Colors.accent} style={styles.subtitle}>
              PRACTICAL FITNESS & INDIAN DIET ADVISOR
            </Typography>
            <Typography variant="h1">AI Coach</Typography>
          </View>

          <TouchableOpacity onPress={handleClearHistory} style={styles.clearBtn}>
            <Typography variant="captionBold" color={Colors.textMuted}>
              CLEAR
            </Typography>
          </TouchableOpacity>
        </View>

        {/* API Key Missing Notice */}
        {!hasApiKey ? (
          <TouchableOpacity
            style={styles.keyNotice}
            onPress={() => router.push('/(tabs)/settings')}
            activeOpacity={0.8}
          >
            <Typography variant="captionBold" color={Colors.error}>
              API KEY MISSING
            </Typography>
            <Typography variant="caption" color={Colors.text}>
              Tap here to enter your Gemini or Claude API key in Settings.
            </Typography>
          </TouchableOpacity>
        ) : null}

        {/* Messages List */}
        <ScrollView
          ref={scrollRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((m) => (
            <ChatBubble
              key={m.id}
              role={m.role}
              content={m.content}
            />
          ))}

          {isStreaming && streamBuffer ? (
            <ChatBubble
              role="assistant"
              content={streamBuffer}
              isStreaming={true}
            />
          ) : null}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask coach about form, roti limit, chai, soreness..."
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={600}
            selectionColor={Colors.accent}
          />

          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() || isStreaming) && styles.sendBtnDisabled]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isStreaming}
            activeOpacity={0.7}
          >
            <Typography
              variant="captionBold"
              color={!inputText.trim() || isStreaming ? Colors.textMuted : Colors.textInverse}
            >
              SEND
            </Typography>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  subtitle: {
    letterSpacing: 1,
    marginBottom: 2,
  },
  clearBtn: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: BorderRadius.sm,
  },
  keyNotice: {
    backgroundColor: Colors.surface,
    borderLeftWidth: 3,
    borderLeftColor: Colors.error,
    padding: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.xs,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.sm,
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 14,
    color: Colors.text,
    minHeight: 44,
    maxHeight: 100,
  },
  sendBtn: {
    minHeight: 44,
    minWidth: 64,
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  sendBtnDisabled: {
    backgroundColor: Colors.border,
  },
});
