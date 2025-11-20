export interface Workout {
  id: number; // Z_PK
  workoutId: string; // ZID (BLOB)
  routineName: string; // ZROUTINENAME
  startDate: string; // ZSTARTDATE (converted to ISO string)
  endDate: string | null; // ZENDDATE (converted to ISO string)
  duration: number; // ZDURATION in seconds
  bodyweight: number | null; // ZBODYWEIGHT in kg
  exerciseCount?: number; // Computed count of exercises
}

export interface GymSet {
  setId: number; // Z_PK
  setResultId: string; // ZID
  reps: number; // ZREPS
  weight: number; // ZWEIGHT in kg
  volume: number; // ZVOLUME in kg
  isWarmup: boolean; // ZWARMUPSET
  rpe: number | null; // ZRPE (Rate of Perceived Exertion 1-10)
  time: number | null; // ZTIME for timed exercises
}

export interface Exercise {
  exerciseId: number; // Z_PK from ZEXERCISERESULT
  exerciseResultId: string; // ZID
  exerciseName: string; // From ZEXERCISEINFORMATION.ZNAME
  exerciseInfoId: string; // From ZEXERCISEINFORMATION.ZID
  maxWeight: number | null; // ZMAXWEIGHT in kg
  volume: number; // ZVOLUME in kg
  muscles?: string | null; // ZMUSCLES from ZEXERCISEINFORMATION (primary muscles)
  secondaryMuscles?: string | null; // ZSECONDARYMUSCLES from ZEXERCISEINFORMATION (comma-separated)
  sets: GymSet[]; // Sets for this exercise
}

export interface WorkoutDetail extends Workout {
  exercises: Exercise[];
}
