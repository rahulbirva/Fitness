export type WorkoutType = 'upper' | 'lower_core' | 'cardio_abs' | 'rest';

export interface WorkoutExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  weightNote?: string;
}

export interface WorkoutDay {
  dayNumber: number;
  week: number;
  dayOfWeek: string;
  type: WorkoutType;
  title: string;
  durationMinutes: number;
  exercises: WorkoutExercise[];
  warmup: string;
  cooldown: string;
  notes: string;
}

// Progressive upper body sets
function getUpperExercises(week: number): WorkoutExercise[] {
  switch (week) {
    case 1:
      return [
        { exerciseId: 'pushup', name: 'Push-Up', sets: 3, reps: '8-10 reps', restSeconds: 60, weightNote: 'Bodyweight' },
        { exerciseId: 'shoulder_press', name: 'Dumbbell Shoulder Press', sets: 3, reps: '10 reps', restSeconds: 60, weightNote: 'Light to moderate' },
        { exerciseId: 'db_row', name: 'Dumbbell Row', sets: 3, reps: '10 reps', restSeconds: 60, weightNote: 'Moderate' },
        { exerciseId: 'lat_pulldown', name: 'Lat Pulldown', sets: 3, reps: '10-12 reps', restSeconds: 60, weightNote: 'Comfortable weight' },
        { exerciseId: 'bicep_curl', name: 'Dumbbell Bicep Curl', sets: 3, reps: '10 reps', restSeconds: 45, weightNote: 'Moderate' },
        { exerciseId: 'tricep_dip', name: 'Triceps Dip', sets: 3, reps: '10 reps', restSeconds: 45, weightNote: 'Bodyweight' },
      ];
    case 2:
      return [
        { exerciseId: 'pushup', name: 'Push-Up', sets: 3, reps: '12 reps', restSeconds: 60, weightNote: 'Bodyweight' },
        { exerciseId: 'shoulder_press', name: 'Dumbbell Shoulder Press', sets: 3, reps: '12 reps', restSeconds: 60, weightNote: 'Increase +1 kg' },
        { exerciseId: 'db_row', name: 'Dumbbell Row', sets: 3, reps: '12 reps', restSeconds: 60, weightNote: 'Increase +1 kg' },
        { exerciseId: 'lat_pulldown', name: 'Lat Pulldown', sets: 3, reps: '12 reps', restSeconds: 60, weightNote: 'Moderate' },
        { exerciseId: 'bicep_curl', name: 'Dumbbell Bicep Curl', sets: 3, reps: '12 reps', restSeconds: 45, weightNote: 'Moderate' },
        { exerciseId: 'tricep_dip', name: 'Triceps Dip', sets: 3, reps: '12 reps', restSeconds: 45, weightNote: 'Bodyweight' },
      ];
    case 3:
      return [
        { exerciseId: 'bench_press', name: 'Dumbbell Bench Press', sets: 4, reps: '10 reps', restSeconds: 60, weightNote: 'Moderate heavy' },
        { exerciseId: 'shoulder_press', name: 'Dumbbell Shoulder Press', sets: 4, reps: '10 reps', restSeconds: 60, weightNote: 'Moderate heavy' },
        { exerciseId: 'db_row', name: 'Dumbbell Row', sets: 4, reps: '10 reps', restSeconds: 60, weightNote: 'Heavy' },
        { exerciseId: 'pullup', name: 'Pull-Up', sets: 4, reps: '6-8 reps', restSeconds: 60, weightNote: 'Assisted or strict' },
        { exerciseId: 'bicep_curl', name: 'Dumbbell Bicep Curl', sets: 4, reps: '10 reps', restSeconds: 45, weightNote: 'Moderate heavy' },
        { exerciseId: 'tricep_dip', name: 'Triceps Dip', sets: 4, reps: '12 reps', restSeconds: 45, weightNote: 'Legs elevated' },
      ];
    case 4:
    default:
      return [
        { exerciseId: 'pushup', name: 'Push-Up', sets: 4, reps: '15 reps', restSeconds: 60, weightNote: 'Strict tempo' },
        { exerciseId: 'shoulder_press', name: 'Dumbbell Shoulder Press', sets: 4, reps: '12 reps', restSeconds: 60, weightNote: 'Peak effort' },
        { exerciseId: 'db_row', name: 'Dumbbell Row', sets: 4, reps: '12 reps', restSeconds: 60, weightNote: 'Peak effort' },
        { exerciseId: 'lat_pulldown', name: 'Lat Pulldown', sets: 4, reps: '12 reps', restSeconds: 60, weightNote: 'Drop set on last' },
        { exerciseId: 'bicep_curl', name: 'Dumbbell Bicep Curl', sets: 4, reps: '12 reps', restSeconds: 45, weightNote: 'Peak contraction' },
        { exerciseId: 'tricep_dip', name: 'Triceps Dip', sets: 4, reps: '15 reps', restSeconds: 45, weightNote: 'Bodyweight' },
      ];
  }
}

// Progressive lower body + core sets
function getLowerCoreExercises(week: number): WorkoutExercise[] {
  switch (week) {
    case 1:
      return [
        { exerciseId: 'squat', name: 'Bodyweight / Goblet Squat', sets: 3, reps: '12 reps', restSeconds: 75, weightNote: 'Bodyweight or light' },
        { exerciseId: 'lunge', name: 'Reverse Lunge', sets: 3, reps: '10 each leg', restSeconds: 60, weightNote: 'Bodyweight' },
        { exerciseId: 'rdl', name: 'Romanian Deadlift', sets: 3, reps: '10 reps', restSeconds: 75, weightNote: 'Moderate' },
        { exerciseId: 'glute_bridge', name: 'Glute Bridge', sets: 3, reps: '15 reps', restSeconds: 45, weightNote: '2 sec pause at top' },
        { exerciseId: 'plank', name: 'Forearm Plank', sets: 3, reps: '35 seconds', restSeconds: 45, weightNote: 'Strict form' },
        { exerciseId: 'leg_raise', name: 'Lying Leg Raise', sets: 3, reps: '10 reps', restSeconds: 45, weightNote: 'Controlled descent' },
        { exerciseId: 'crunch', name: 'Abdominal Crunch', sets: 3, reps: '15 reps', restSeconds: 30, weightNote: '1 sec squeeze' },
      ];
    case 2:
      return [
        { exerciseId: 'squat', name: 'Bodyweight / Goblet Squat', sets: 3, reps: '15 reps', restSeconds: 75, weightNote: 'Add +2 kg dumbbell' },
        { exerciseId: 'lunge', name: 'Reverse Lunge', sets: 3, reps: '12 each leg', restSeconds: 60, weightNote: 'Bodyweight' },
        { exerciseId: 'rdl', name: 'Romanian Deadlift', sets: 3, reps: '12 reps', restSeconds: 75, weightNote: 'Moderate +1 kg' },
        { exerciseId: 'glute_bridge', name: 'Glute Bridge', sets: 3, reps: '20 reps', restSeconds: 45, weightNote: '2 sec pause at top' },
        { exerciseId: 'plank', name: 'Forearm Plank', sets: 3, reps: '45 seconds', restSeconds: 45, weightNote: 'Tight core' },
        { exerciseId: 'leg_raise', name: 'Lying Leg Raise', sets: 3, reps: '12 reps', restSeconds: 45, weightNote: 'Slow negative' },
        { exerciseId: 'crunch', name: 'Abdominal Crunch', sets: 3, reps: '20 reps', restSeconds: 30, weightNote: '1 sec squeeze' },
      ];
    case 3:
      return [
        { exerciseId: 'squat', name: 'Bodyweight / Goblet Squat', sets: 4, reps: '12 reps', restSeconds: 75, weightNote: 'Moderate heavy dumbbell' },
        { exerciseId: 'lunge', name: 'Reverse Lunge', sets: 4, reps: '12 each leg', restSeconds: 60, weightNote: 'Dumbbells in hands' },
        { exerciseId: 'rdl', name: 'Romanian Deadlift', sets: 4, reps: '10 reps', restSeconds: 75, weightNote: 'Heavy dumbbells' },
        { exerciseId: 'glute_bridge', name: 'Glute Bridge', sets: 4, reps: '15 reps', restSeconds: 45, weightNote: 'Weight on hips' },
        { exerciseId: 'plank', name: 'Forearm Plank', sets: 3, reps: '50 seconds', restSeconds: 45, weightNote: 'Solid hold' },
        { exerciseId: 'leg_raise', name: 'Lying Leg Raise', sets: 4, reps: '12 reps', restSeconds: 45, weightNote: 'No swinging' },
        { exerciseId: 'crunch', name: 'Abdominal Crunch', sets: 3, reps: '25 reps', restSeconds: 30, weightNote: 'Burnout pace' },
      ];
    case 4:
    default:
      return [
        { exerciseId: 'squat', name: 'Bodyweight / Goblet Squat', sets: 4, reps: '15 reps', restSeconds: 75, weightNote: 'Heavy dumbbell' },
        { exerciseId: 'lunge', name: 'Reverse Lunge', sets: 4, reps: '14 each leg', restSeconds: 60, weightNote: 'Dumbbells in hands' },
        { exerciseId: 'rdl', name: 'Romanian Deadlift', sets: 4, reps: '12 reps', restSeconds: 75, weightNote: 'Heavy dumbbells' },
        { exerciseId: 'glute_bridge', name: 'Glute Bridge', sets: 4, reps: '20 reps', restSeconds: 45, weightNote: 'Plate or dumbbell on hips' },
        { exerciseId: 'plank', name: 'Forearm Plank', sets: 4, reps: '60 seconds', restSeconds: 45, weightNote: 'Max tension' },
        { exerciseId: 'leg_raise', name: 'Lying Leg Raise', sets: 4, reps: '15 reps', restSeconds: 45, weightNote: 'Strict core control' },
        { exerciseId: 'crunch', name: 'Abdominal Crunch', sets: 4, reps: '25 reps', restSeconds: 30, weightNote: 'Peak contraction' },
      ];
  }
}

function getCardioAbsExercises(week: number): WorkoutExercise[] {
  const plankDuration = week >= 3 ? '50 seconds' : '40 seconds';
  const crunchReps = week >= 3 ? '25 reps' : '20 reps';
  const legRaiseReps = week >= 3 ? '15 reps' : '12 reps';

  return [
    { exerciseId: 'incline_walk', name: 'Incline Treadmill Walk or Cycling', sets: 1, reps: '40 min steady', restSeconds: 0, weightNote: 'Heart rate 130-145 bpm' },
    { exerciseId: 'plank', name: 'Forearm Plank', sets: 3, reps: plankDuration, restSeconds: 45, weightNote: 'Core tight' },
    { exerciseId: 'crunch', name: 'Abdominal Crunch', sets: 3, reps: crunchReps, restSeconds: 30, weightNote: 'Exhale at top' },
    { exerciseId: 'leg_raise', name: 'Lying Leg Raise', sets: 3, reps: legRaiseReps, restSeconds: 30, weightNote: 'Lower back flat' },
  ];
}

function getRestExercises(): WorkoutExercise[] {
  return [
    { exerciseId: 'incline_walk', name: 'Active Recovery Walk', sets: 1, reps: '30-45 min outdoor walk', restSeconds: 0, weightNote: 'Easy conversational pace' },
  ];
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function generateWorkoutPlan(): WorkoutDay[] {
  const plan: WorkoutDay[] = [];

  for (let day = 1; day <= 30; day++) {
    const dayOfWeekIndex = (day - 1) % 7;
    const dayOfWeek = DAYS_OF_WEEK[dayOfWeekIndex];
    const week = Math.ceil(day / 7);

    let type: WorkoutType;
    let title: string;
    let durationMinutes: number;
    let exercises: WorkoutExercise[];
    let warmup = '5 min arm circles, torso twists, jumping jacks';
    let cooldown = '5 min shoulder, lat, chest static stretches';
    let notes = '';

    switch (dayOfWeek) {
      case 'Mon':
        type = 'upper';
        title = `Upper Body Strength (Week ${week})`;
        durationMinutes = 60;
        exercises = getUpperExercises(week);
        notes = 'Focus on controlled eccentric phase. 60 min session includes warmup and cooldown.';
        break;
      case 'Tue':
        type = 'lower_core';
        title = `Lower Body & Core (Week ${week})`;
        durationMinutes = 60;
        exercises = getLowerCoreExercises(week);
        warmup = '5 min bodyweight squats, hip openers, high knees';
        cooldown = '5 min hamstring, quad, glute static stretches';
        notes = 'Drive through heels. Keep ribs locked over pelvis during core work.';
        break;
      case 'Wed':
        type = 'cardio_abs';
        title = 'Cardio & Abs Conditioning';
        durationMinutes = 60;
        exercises = getCardioAbsExercises(week);
        warmup = '3 min easy walk or pedal';
        cooldown = '5 min gentle walking & calf stretch';
        notes = '40 min steady incline walk (8-12%) or cycling + 15 min dedicated abs circuits.';
        break;
      case 'Thu':
        type = 'upper';
        title = `Upper Body Hypertrophy (Week ${week})`;
        durationMinutes = 60;
        exercises = getUpperExercises(week);
        notes = 'Squeeze at top of every curl and row. Rest times strictly timed.';
        break;
      case 'Fri':
        type = 'lower_core';
        title = `Lower Body & Core Power (Week ${week})`;
        durationMinutes = 60;
        exercises = getLowerCoreExercises(week);
        warmup = '5 min leg swings, glute bridges, hip rotations';
        cooldown = '5 min deep hip flexor & lower back stretches';
        notes = 'Finish strong before the weekend. Maintain full range of motion.';
        break;
      case 'Sat':
        type = 'cardio_abs';
        title = 'Cardio Burn & Abs';
        durationMinutes = 60;
        exercises = getCardioAbsExercises(week);
        warmup = '3 min gradual warmup';
        cooldown = '5 min full body cooldown';
        notes = '40 min cardio + 15 min abs. Stay hydrated with 3.5 L water.';
        break;
      case 'Sun':
      default:
        type = 'rest';
        title = 'Active Recovery & Walk';
        durationMinutes = 45;
        exercises = getRestExercises();
        warmup = 'Gentle joint mobility';
        cooldown = 'Full body relaxing stretch';
        notes = 'Rest day. 30 to 45 min relaxed walk. Sleep 8 hours, prepare meals for the week.';
        break;
    }

    plan.push({
      dayNumber: day,
      week,
      dayOfWeek,
      type,
      title,
      durationMinutes,
      exercises,
      warmup,
      cooldown,
      notes,
    });
  }

  return plan;
}

export const WORKOUT_PLAN: WorkoutDay[] = generateWorkoutPlan();
