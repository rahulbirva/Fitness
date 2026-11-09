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

// Progressive 100% Zero-Equipment Bodyweight Upper Body Sets
function getUpperExercises(week: number): WorkoutExercise[] {
  switch (week) {
    case 1:
      return [
        { exerciseId: 'pushup', name: 'Standard Push-Up', sets: 3, reps: '8-10 reps', restSeconds: 60, weightNote: 'Bodyweight (Floor)' },
        { exerciseId: 'pike_pushup', name: 'Pike Push-Up (Shoulder Press)', sets: 3, reps: '8-10 reps', restSeconds: 60, weightNote: 'Bodyweight (Pike angle)' },
        { exerciseId: 'doorframe_row', name: 'Doorframe / Towel Row', sets: 3, reps: '10 reps', restSeconds: 60, weightNote: 'Lean back 45 degrees' },
        { exerciseId: 'superman_pull', name: 'Prone Superman Lat Pull', sets: 3, reps: '12 reps', restSeconds: 60, weightNote: '2 sec squeeze at back' },
        { exerciseId: 'towel_bicep_curl', name: 'Doorway / Towel Bicep Curl', sets: 3, reps: '10 reps', restSeconds: 45, weightNote: 'Isometric foot resistance' },
        { exerciseId: 'tricep_dip', name: 'Chair / Couch Triceps Dip', sets: 3, reps: '10 reps', restSeconds: 45, weightNote: 'Chair edge, knees bent' },
      ];
    case 2:
      return [
        { exerciseId: 'pushup', name: 'Standard Push-Up', sets: 3, reps: '12 reps', restSeconds: 60, weightNote: 'Strict 2 sec descent' },
        { exerciseId: 'pike_pushup', name: 'Pike Push-Up (Shoulder Press)', sets: 3, reps: '12 reps', restSeconds: 60, weightNote: 'Walk feet closer' },
        { exerciseId: 'doorframe_row', name: 'Doorframe / Towel Row', sets: 3, reps: '12 reps', restSeconds: 60, weightNote: 'Steeper lean angle' },
        { exerciseId: 'superman_pull', name: 'Prone Superman Lat Pull', sets: 3, reps: '15 reps', restSeconds: 60, weightNote: '3 sec squeeze' },
        { exerciseId: 'towel_bicep_curl', name: 'Doorway / Towel Bicep Curl', sets: 3, reps: '12 reps', restSeconds: 45, weightNote: 'Maximum tension hold' },
        { exerciseId: 'tricep_dip', name: 'Chair / Couch Triceps Dip', sets: 3, reps: '12 reps', restSeconds: 45, weightNote: 'Legs extended straight' },
      ];
    case 3:
      return [
        { exerciseId: 'pushup', name: 'Slow Tempo Push-Up', sets: 4, reps: '12 reps', restSeconds: 60, weightNote: '3 sec down, explosive up' },
        { exerciseId: 'pike_pushup', name: 'Elevated Pike Push-Up', sets: 4, reps: '10 reps', restSeconds: 60, weightNote: 'Feet elevated on chair' },
        { exerciseId: 'doorframe_row', name: 'Doorframe Single-Arm Row', sets: 4, reps: '10 each arm', restSeconds: 60, weightNote: 'Unilateral back focus' },
        { exerciseId: 'superman_pull', name: 'Prone Superman Lat Pull', sets: 4, reps: '15 reps', restSeconds: 60, weightNote: 'Strict tempo' },
        { exerciseId: 'towel_bicep_curl', name: 'Doorway / Towel Bicep Curl', sets: 4, reps: '12 reps', restSeconds: 45, weightNote: '5 sec peak squeeze' },
        { exerciseId: 'tricep_dip', name: 'Chair Triceps Dip', sets: 4, reps: '15 reps', restSeconds: 45, weightNote: 'Legs elevated on second chair' },
      ];
    case 4:
    default:
      return [
        { exerciseId: 'pushup', name: 'Peak Volume Push-Up', sets: 4, reps: '15 reps', restSeconds: 60, weightNote: 'Chest 2cm off floor' },
        { exerciseId: 'pike_pushup', name: 'Elevated Pike Push-Up', sets: 4, reps: '12 reps', restSeconds: 60, weightNote: 'Feet on chair / couch' },
        { exerciseId: 'doorframe_row', name: 'Doorframe / Towel Row', sets: 4, reps: '14 reps', restSeconds: 60, weightNote: 'Max lean angle' },
        { exerciseId: 'superman_pull', name: 'Prone Superman Lat Pull', sets: 4, reps: '18 reps', restSeconds: 60, weightNote: 'Burnout lat pump' },
        { exerciseId: 'towel_bicep_curl', name: 'Doorway / Towel Bicep Curl', sets: 4, reps: '14 reps', restSeconds: 45, weightNote: 'Peak contraction' },
        { exerciseId: 'tricep_dip', name: 'Chair Triceps Dip', sets: 4, reps: '18 reps', restSeconds: 45, weightNote: 'Continuous tension' },
      ];
  }
}

// Progressive 100% Zero-Equipment Lower Body + Core Sets
function getLowerCoreExercises(week: number): WorkoutExercise[] {
  switch (week) {
    case 1:
      return [
        { exerciseId: 'squat', name: 'Bodyweight Tempo Squat', sets: 3, reps: '12 reps', restSeconds: 60, weightNote: '3 sec descent, zero weights' },
        { exerciseId: 'lunge', name: 'Reverse Lunge', sets: 3, reps: '10 each leg', restSeconds: 60, weightNote: 'Bodyweight balance' },
        { exerciseId: 'single_leg_rdl', name: 'Single-Leg Bodyweight RDL', sets: 3, reps: '10 each leg', restSeconds: 60, weightNote: 'Hamstring stretch' },
        { exerciseId: 'glute_bridge', name: 'Floor Glute Bridge', sets: 3, reps: '15 reps', restSeconds: 45, weightNote: '2 sec squeeze at top' },
        { exerciseId: 'plank', name: 'Forearm Plank', sets: 3, reps: '35 seconds', restSeconds: 45, weightNote: 'Strict hollow body' },
        { exerciseId: 'leg_raise', name: 'Lying Floor Leg Raise', sets: 3, reps: '10 reps', restSeconds: 45, weightNote: 'Controlled negative' },
        { exerciseId: 'crunch', name: 'Abdominal Crunch', sets: 3, reps: '15 reps', restSeconds: 30, weightNote: '1 sec squeeze' },
      ];
    case 2:
      return [
        { exerciseId: 'squat', name: 'Bodyweight Tempo Squat', sets: 3, reps: '15 reps', restSeconds: 60, weightNote: 'Deep thigh parallel' },
        { exerciseId: 'lunge', name: 'Reverse Lunge', sets: 3, reps: '12 each leg', restSeconds: 60, weightNote: 'Knee 2cm off floor' },
        { exerciseId: 'single_leg_rdl', name: 'Single-Leg Bodyweight RDL', sets: 3, reps: '12 each leg', restSeconds: 60, weightNote: 'Flat back hinge' },
        { exerciseId: 'glute_bridge', name: 'Floor Glute Bridge', sets: 3, reps: '20 reps', restSeconds: 45, weightNote: '2 sec pause at top' },
        { exerciseId: 'plank', name: 'Forearm Plank', sets: 3, reps: '45 seconds', restSeconds: 45, weightNote: 'Tight abs and glutes' },
        { exerciseId: 'leg_raise', name: 'Lying Floor Leg Raise', sets: 3, reps: '12 reps', restSeconds: 45, weightNote: 'Slow negative' },
        { exerciseId: 'crunch', name: 'Abdominal Crunch & Bicycle', sets: 3, reps: '20 reps', restSeconds: 30, weightNote: 'Continuous burn' },
      ];
    case 3:
      return [
        { exerciseId: 'squat', name: 'Pause Squat (2 Sec Pause)', sets: 4, reps: '12 reps', restSeconds: 60, weightNote: 'Dead stop at bottom' },
        { exerciseId: 'lunge', name: 'Walking / Reverse Lunge', sets: 4, reps: '14 each leg', restSeconds: 60, weightNote: 'Continuous stepping' },
        { exerciseId: 'single_leg_rdl', name: 'Single-Leg Bodyweight RDL', sets: 4, reps: '12 each leg', restSeconds: 60, weightNote: 'Deep hamstring pull' },
        { exerciseId: 'glute_bridge', name: 'Single-Leg Glute Bridge', sets: 4, reps: '10 each leg', restSeconds: 45, weightNote: 'One leg extended in air' },
        { exerciseId: 'plank', name: 'Forearm Plank', sets: 3, reps: '50 seconds', restSeconds: 45, weightNote: 'Rock solid hold' },
        { exerciseId: 'leg_raise', name: 'Lying Floor Leg Raise', sets: 4, reps: '12 reps', restSeconds: 45, weightNote: 'No swinging' },
        { exerciseId: 'crunch', name: 'Bicycle Crunches', sets: 3, reps: '25 reps', restSeconds: 30, weightNote: 'Elbow-to-opposite-knee' },
      ];
    case 4:
    default:
      return [
        { exerciseId: 'squat', name: 'Bodyweight Jump / Tempo Squat', sets: 4, reps: '16 reps', restSeconds: 60, weightNote: 'Explosive ascent' },
        { exerciseId: 'lunge', name: 'Reverse Lunge Pulse', sets: 4, reps: '14 each leg', restSeconds: 60, weightNote: 'High quad tension' },
        { exerciseId: 'single_leg_rdl', name: 'Single-Leg Bodyweight RDL', sets: 4, reps: '14 each leg', restSeconds: 60, weightNote: 'Controlled balance' },
        { exerciseId: 'glute_bridge', name: 'Single-Leg Glute Bridge', sets: 4, reps: '12 each leg', restSeconds: 45, weightNote: 'Max glute burn' },
        { exerciseId: 'plank', name: 'Forearm Plank', sets: 4, reps: '60 seconds', restSeconds: 45, weightNote: '1 full minute hold' },
        { exerciseId: 'leg_raise', name: 'Lying Floor Leg Raise', sets: 4, reps: '15 reps', restSeconds: 45, weightNote: 'Strict core control' },
        { exerciseId: 'crunch', name: 'Abdominal Crunch', sets: 4, reps: '25 reps', restSeconds: 30, weightNote: 'Peak contraction' },
      ];
  }
}

// Progressive 100% Zero-Equipment Cardio & Abs Sets
function getCardioAbsExercises(week: number): WorkoutExercise[] {
  const plankDuration = week >= 3 ? '50 seconds' : '40 seconds';
  const crunchReps = week >= 3 ? '25 reps' : '20 reps';
  const legRaiseReps = week >= 3 ? '15 reps' : '12 reps';

  return [
    { exerciseId: 'brisk_walk', name: '40 Min Outdoor / Indoor Brisk Walk & Spot Jogging', sets: 1, reps: '40 min continuous', restSeconds: 0, weightNote: 'Zero equipment fat burn (6 km/h pace)' },
    { exerciseId: 'high_knees_cardio', name: 'High Knees & Mountain Climbers Circuit', sets: 3, reps: '45 sec each', restSeconds: 30, weightNote: 'Rapid fat-loss pulse' },
    { exerciseId: 'plank', name: 'Forearm Plank', sets: 3, reps: plankDuration, restSeconds: 45, weightNote: 'Strict core hold' },
    { exerciseId: 'crunch', name: 'Abdominal & Bicycle Crunch', sets: 3, reps: crunchReps, restSeconds: 30, weightNote: 'Exhale at contraction' },
    { exerciseId: 'leg_raise', name: 'Lying Floor Leg Raise', sets: 3, reps: legRaiseReps, restSeconds: 30, weightNote: 'Lower back flat' },
  ];
}

function getRestExercises(): WorkoutExercise[] {
  return [
    { exerciseId: 'brisk_walk', name: '30-45 Min Active Recovery Walk', sets: 1, reps: '30-45 min outdoor walk', restSeconds: 0, weightNote: 'Relaxed easy pace + full body stretches' },
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
    let warmup = '5 min arm circles, torso twists, high knees, neck rolls';
    let cooldown = '5 min shoulder, chest, hamstring, quad static stretches';
    let notes = '';

    switch (dayOfWeek) {
      case 'Mon':
        type = 'upper';
        title = `Zero-Equipment Upper Body (Week ${week})`;
        durationMinutes = 60;
        exercises = getUpperExercises(week);
        notes = 'Bodyweight push-ups, pike presses, doorframe rows, and dips. 60 min session.';
        break;
      case 'Tue':
        type = 'lower_core';
        title = `Zero-Equipment Lower Body & Core (Week ${week})`;
        durationMinutes = 60;
        exercises = getLowerCoreExercises(week);
        notes = 'Tempo squats, reverse lunges, single-leg RDLs, glute bridges, and ab circuit.';
        break;
      case 'Wed':
        type = 'cardio_abs';
        title = `Brisk Walk Cardio & Abs (Week ${week})`;
        durationMinutes = 55;
        exercises = getCardioAbsExercises(week);
        notes = '40 min steady brisk walk or indoor spot jogging followed by 15 min core circuit.';
        break;
      case 'Thu':
        type = 'upper';
        title = `Zero-Equipment Upper Body Density (Week ${week})`;
        durationMinutes = 60;
        exercises = getUpperExercises(week);
        notes = 'Second upper body session of the week. Focus on strict tempo and depth.';
        break;
      case 'Fri':
        type = 'lower_core';
        title = `Zero-Equipment Lower Body & Core (Week ${week})`;
        durationMinutes = 60;
        exercises = getLowerCoreExercises(week);
        notes = 'Lower body hypertrophy and core endurance. Focus on glute and hamstring tension.';
        break;
      case 'Sat':
        type = 'cardio_abs';
        title = `Cardio Fat Burn & Abs (Week ${week})`;
        durationMinutes = 55;
        exercises = getCardioAbsExercises(week);
        notes = 'Cardio endurance and abs. Keep heart rate elevated in zone 2 fat burn.';
        break;
      case 'Sun':
      default:
        type = 'rest';
        title = `Active Recovery & Mobility (Week ${week})`;
        durationMinutes = 45;
        exercises = getRestExercises();
        warmup = '3 min deep belly breathing';
        cooldown = '10 min full body mobility flow';
        notes = 'Rest and recharge. 30 to 45 min relaxed walk, hydrate with 3.5 L water.';
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
