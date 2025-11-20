import { getDb } from './client';
import type { Workout, WorkoutDetail, Exercise, GymSet } from '@/types/workout';
import { formatExerciseName } from '@/lib/formatters';

// Core Data epoch: seconds from 2001-01-01 00:00:00 UTC
const CORE_DATA_EPOCH = 978307200;

/**
 * Convert Core Data timestamp to ISO date string
 */
function convertCoreDataDate(timestamp: number | null): string | null {
  if (timestamp === null) return null;
  // Core Data stores dates as seconds since 2001-01-01
  // Convert to Unix timestamp (seconds since 1970-01-01)
  const unixTimestamp = timestamp + CORE_DATA_EPOCH;
  return new Date(unixTimestamp * 1000).toISOString();
}

/**
 * Get all workouts with basic information, sorted by date (newest first)
 */
export function getWorkouts(): Workout[] {
  const db = getDb();

  const stmt = db.prepare(`
    SELECT
      Z_PK as id,
      ZROUTINENAME as routineName,
      ZSTARTDATE as startDate,
      ZENDDATE as endDate,
      ZDURATION as duration,
      ZBODYWEIGHT as bodyweight
    FROM ZWORKOUTRESULT
    WHERE ZROUTINENAME IS NOT NULL
    ORDER BY ZSTARTDATE DESC
  `);

  const rows = stmt.all() as Array<{
    id: number;
    routineName: string;
    startDate: number;
    endDate: number | null;
    duration: number;
    bodyweight: number | null;
  }>;

  return rows.map(row => ({
    id: row.id,
    workoutId: String(row.id), // Using id as workoutId for simplicity
    routineName: row.routineName,
    startDate: convertCoreDataDate(row.startDate) || '',
    endDate: convertCoreDataDate(row.endDate),
    duration: row.duration,
    bodyweight: row.bodyweight
  }));
}

/**
 * Get detailed workout information including all exercises and sets
 */
export function getWorkoutDetail(workoutId: number): WorkoutDetail | null {
  const db = getDb();

  // Get workout header
  const workoutStmt = db.prepare(`
    SELECT
      Z_PK as id,
      ZROUTINENAME as routineName,
      ZSTARTDATE as startDate,
      ZENDDATE as endDate,
      ZDURATION as duration,
      ZBODYWEIGHT as bodyweight
    FROM ZWORKOUTRESULT
    WHERE Z_PK = ?
  `);

  const workoutRow = workoutStmt.get(workoutId) as {
    id: number;
    routineName: string;
    startDate: number;
    endDate: number | null;
    duration: number;
    bodyweight: number | null;
  } | undefined;

  if (!workoutRow) return null;

  const workout: Workout = {
    id: workoutRow.id,
    workoutId: String(workoutRow.id),
    routineName: workoutRow.routineName,
    startDate: convertCoreDataDate(workoutRow.startDate) || '',
    endDate: convertCoreDataDate(workoutRow.endDate),
    duration: workoutRow.duration,
    bodyweight: workoutRow.bodyweight
  };

  // Get exercises for this workout
  const exercisesStmt = db.prepare(`
    SELECT
      er.Z_PK as exerciseId,
      ei.ZNAME as exerciseName,
      er.ZMAXWEIGHT as maxWeight,
      er.ZVOLUME as volume,
      ei.ZMUSCLES as muscles,
      ei.ZSECONDARYMUSCLES as secondaryMuscles,
      ei.ZISUSERCREATED as isUserCreated
    FROM ZEXERCISERESULT er
    LEFT JOIN ZEXERCISECONFIGURATION ec ON er.ZCONFIGURATION = ec.Z_PK
    LEFT JOIN ZEXERCISEINFORMATION ei ON ec.ZINFORMATION = ei.Z_PK
    WHERE er.ZWORKOUT = ?
    ORDER BY er.Z_FOK_WORKOUT ASC
  `);

  const exerciseRows = exercisesStmt.all(workoutId) as Array<{
    exerciseId: number;
    exerciseName: string | null;
    maxWeight: number | null;
    volume: number;
    muscles: string | null;
    secondaryMuscles: string | null;
    isUserCreated: number; // SQLite boolean: 0 or 1
  }>;

  // Get sets for each exercise
  const setsStmt = db.prepare(`
    SELECT
      Z_PK as setId,
      ZREPS as reps,
      ZWEIGHT as weight,
      ZVOLUME as volume,
      ZWARMUPSET as isWarmup,
      ZRPE as rpe,
      ZTIME as time
    FROM ZGYMSETRESULT
    WHERE ZEXERCISE = ?
    ORDER BY Z_FOK_EXERCISE ASC
  `);

  const exercises: Exercise[] = exerciseRows.map(exerciseRow => {
    const setRows = setsStmt.all(exerciseRow.exerciseId) as Array<{
      setId: number;
      reps: number;
      weight: number;
      volume: number;
      isWarmup: number;
      rpe: number | null;
      time: number | null;
    }>;

    const sets: GymSet[] = setRows.map(setRow => ({
      setId: setRow.setId,
      setResultId: String(setRow.setId),
      reps: setRow.reps,
      weight: setRow.weight,
      volume: setRow.volume,
      isWarmup: setRow.isWarmup === 1,
      rpe: setRow.rpe,
      time: setRow.time
    }));

    const exerciseName = exerciseRow.exerciseName || 'Unknown Exercise';

    return {
      exerciseId: exerciseRow.exerciseId,
      exerciseResultId: String(exerciseRow.exerciseId),
      exerciseName: exerciseRow.isUserCreated === 1
        ? exerciseName // User-created: use as-is
        : formatExerciseName(exerciseName), // Built-in: convert snake_case to Title Case
      exerciseInfoId: String(exerciseRow.exerciseId),
      maxWeight: exerciseRow.maxWeight,
      volume: exerciseRow.volume,
      muscles: exerciseRow.muscles,
      secondaryMuscles: exerciseRow.secondaryMuscles,
      sets
    };
  });

  return {
    ...workout,
    exercises,
    exerciseCount: exercises.length
  };
}
