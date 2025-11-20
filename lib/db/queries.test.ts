import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getWorkouts, getWorkoutDetail } from './queries';

// Mock the database client
vi.mock('./client', () => ({
  getDb: vi.fn(),
}));

import { getDb } from './client';

// Core Data epoch: seconds from 2001-01-01 00:00:00 UTC
const CORE_DATA_EPOCH = 978307200;

// Helper to convert date to Core Data timestamp
function toCoreDataTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000) - CORE_DATA_EPOCH;
}

describe('getWorkouts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty array when no workouts exist', () => {
    const mockDb = {
      prepare: vi.fn(() => ({
        all: vi.fn(() => []),
      })),
    };
    vi.mocked(getDb).mockReturnValue(mockDb as any);

    const result = getWorkouts();
    expect(result).toEqual([]);
  });

  it('returns workouts sorted by date (newest first)', () => {
    const now = new Date('2024-11-19T12:00:00Z');
    const yesterday = new Date('2024-11-18T12:00:00Z');

    const mockDb = {
      prepare: vi.fn(() => ({
        all: vi.fn(() => [
          {
            id: 1,
            routineName: 'Upper Body',
            startDate: toCoreDataTimestamp(now),
            endDate: toCoreDataTimestamp(new Date(now.getTime() + 3600000)), // +1 hour
            duration: 3600,
            bodyweight: 80,
          },
          {
            id: 2,
            routineName: 'Lower Body',
            startDate: toCoreDataTimestamp(yesterday),
            endDate: toCoreDataTimestamp(new Date(yesterday.getTime() + 3600000)),
            duration: 3000,
            bodyweight: 80,
          },
        ]),
      })),
    };
    vi.mocked(getDb).mockReturnValue(mockDb as any);

    const result = getWorkouts();
    expect(result).toHaveLength(2);
    expect(result[0].routineName).toBe('Upper Body');
    expect(result[1].routineName).toBe('Lower Body');
  });

  it('converts Core Data timestamps to ISO strings', () => {
    const testDate = new Date('2024-11-19T12:00:00Z');
    const mockDb = {
      prepare: vi.fn(() => ({
        all: vi.fn(() => [
          {
            id: 1,
            routineName: 'Test Workout',
            startDate: toCoreDataTimestamp(testDate),
            endDate: null,
            duration: 3600,
            bodyweight: null,
          },
        ]),
      })),
    };
    vi.mocked(getDb).mockReturnValue(mockDb as any);

    const result = getWorkouts();
    expect(result[0].startDate).toBe(testDate.toISOString());
    expect(result[0].endDate).toBeNull();
  });

  it('handles null bodyweight and endDate', () => {
    const mockDb = {
      prepare: vi.fn(() => ({
        all: vi.fn(() => [
          {
            id: 1,
            routineName: 'Test',
            startDate: toCoreDataTimestamp(new Date()),
            endDate: null,
            duration: 1800,
            bodyweight: null,
          },
        ]),
      })),
    };
    vi.mocked(getDb).mockReturnValue(mockDb as any);

    const result = getWorkouts();
    expect(result[0].endDate).toBeNull();
    expect(result[0].bodyweight).toBeNull();
  });

  it('sets workoutId to string version of id', () => {
    const mockDb = {
      prepare: vi.fn(() => ({
        all: vi.fn(() => [
          {
            id: 123,
            routineName: 'Test',
            startDate: toCoreDataTimestamp(new Date()),
            endDate: null,
            duration: 1800,
            bodyweight: null,
          },
        ]),
      })),
    };
    vi.mocked(getDb).mockReturnValue(mockDb as any);

    const result = getWorkouts();
    expect(result[0].id).toBe(123);
    expect(result[0].workoutId).toBe('123');
  });
});

describe('getWorkoutDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when workout does not exist', () => {
    const mockDb = {
      prepare: vi.fn((query: string) => {
        if (query.includes('ZWORKOUTRESULT')) {
          return { get: vi.fn(() => undefined) };
        }
        return { all: vi.fn(() => []) };
      }),
    };
    vi.mocked(getDb).mockReturnValue(mockDb as any);

    const result = getWorkoutDetail(999);
    expect(result).toBeNull();
  });

  it('returns workout with exercises and sets', () => {
    const startDate = new Date('2024-11-19T12:00:00Z');
    const endDate = new Date('2024-11-19T13:00:00Z');

    const mockDb = {
      prepare: vi.fn((query: string) => {
        if (query.includes('FROM ZWORKOUTRESULT')) {
          return {
            get: vi.fn(() => ({
              id: 1,
              routineName: 'Upper Body',
              startDate: toCoreDataTimestamp(startDate),
              endDate: toCoreDataTimestamp(endDate),
              duration: 3600,
              bodyweight: 80,
            })),
          };
        }
        if (query.includes('FROM ZEXERCISERESULT')) {
          return {
            all: vi.fn(() => [
              {
                exerciseId: 10,
                exerciseName: 'barbell_bench_press',
                maxWeight: 100,
                volume: 1000,
                muscles: 'chest',
                secondaryMuscles: 'triceps,shoulders',
                isUserCreated: 0, // built-in exercise
              },
            ]),
          };
        }
        if (query.includes('FROM ZGYMSETRESULT')) {
          return {
            all: vi.fn(() => [
              {
                setId: 100,
                reps: 10,
                weight: 100,
                volume: 1000,
                isWarmup: 0,
                rpe: 8,
                time: null,
              },
              {
                setId: 101,
                reps: 8,
                weight: 110,
                volume: 880,
                isWarmup: 0,
                rpe: 9,
                time: null,
              },
            ]),
          };
        }
        return { all: vi.fn(() => []) };
      }),
    };
    vi.mocked(getDb).mockReturnValue(mockDb as any);

    const result = getWorkoutDetail(1);

    expect(result).not.toBeNull();
    expect(result!.id).toBe(1);
    expect(result!.routineName).toBe('Upper Body');
    expect(result!.exercises).toHaveLength(1);
    expect(result!.exerciseCount).toBe(1);

    const exercise = result!.exercises[0];
    expect(exercise.exerciseName).toBe('Barbell Bench Press'); // formatted from snake_case
    expect(exercise.sets).toHaveLength(2);
    expect(exercise.sets[0].reps).toBe(10);
    expect(exercise.sets[0].isWarmup).toBe(false);
  });

  it('formats built-in exercise names from snake_case', () => {
    const mockDb = {
      prepare: vi.fn((query: string) => {
        if (query.includes('FROM ZWORKOUTRESULT')) {
          return {
            get: vi.fn(() => ({
              id: 1,
              routineName: 'Test',
              startDate: toCoreDataTimestamp(new Date()),
              endDate: null,
              duration: 3600,
              bodyweight: 80,
            })),
          };
        }
        if (query.includes('FROM ZEXERCISERESULT')) {
          return {
            all: vi.fn(() => [
              {
                exerciseId: 10,
                exerciseName: 'pull_up_weighted',
                maxWeight: 25,
                volume: 500,
                muscles: 'lats',
                secondaryMuscles: 'biceps',
                isUserCreated: 0, // built-in
              },
            ]),
          };
        }
        if (query.includes('FROM ZGYMSETRESULT')) {
          return { all: vi.fn(() => []) };
        }
        return { all: vi.fn(() => []) };
      }),
    };
    vi.mocked(getDb).mockReturnValue(mockDb as any);

    const result = getWorkoutDetail(1);
    expect(result!.exercises[0].exerciseName).toBe('Pull Up (Weighted)');
  });

  it('preserves user-created exercise names as-is', () => {
    const mockDb = {
      prepare: vi.fn((query: string) => {
        if (query.includes('FROM ZWORKOUTRESULT')) {
          return {
            get: vi.fn(() => ({
              id: 1,
              routineName: 'Test',
              startDate: toCoreDataTimestamp(new Date()),
              endDate: null,
              duration: 3600,
              bodyweight: 80,
            })),
          };
        }
        if (query.includes('FROM ZEXERCISERESULT')) {
          return {
            all: vi.fn(() => [
              {
                exerciseId: 10,
                exerciseName: 'My Custom Exercise',
                maxWeight: 50,
                volume: 500,
                muscles: null,
                secondaryMuscles: null,
                isUserCreated: 1, // user-created
              },
            ]),
          };
        }
        if (query.includes('FROM ZGYMSETRESULT')) {
          return { all: vi.fn(() => []) };
        }
        return { all: vi.fn(() => []) };
      }),
    };
    vi.mocked(getDb).mockReturnValue(mockDb as any);

    const result = getWorkoutDetail(1);
    expect(result!.exercises[0].exerciseName).toBe('My Custom Exercise');
  });

  it('converts isWarmup from SQLite boolean to boolean', () => {
    const mockDb = {
      prepare: vi.fn((query: string) => {
        if (query.includes('FROM ZWORKOUTRESULT')) {
          return {
            get: vi.fn(() => ({
              id: 1,
              routineName: 'Test',
              startDate: toCoreDataTimestamp(new Date()),
              endDate: null,
              duration: 3600,
              bodyweight: 80,
            })),
          };
        }
        if (query.includes('FROM ZEXERCISERESULT')) {
          return {
            all: vi.fn(() => [
              {
                exerciseId: 10,
                exerciseName: 'test_exercise',
                maxWeight: 50,
                volume: 500,
                muscles: null,
                secondaryMuscles: null,
                isUserCreated: 0,
              },
            ]),
          };
        }
        if (query.includes('FROM ZGYMSETRESULT')) {
          return {
            all: vi.fn(() => [
              {
                setId: 100,
                reps: 10,
                weight: 50,
                volume: 500,
                isWarmup: 1, // SQLite boolean: 1 = true
                rpe: null,
                time: null,
              },
              {
                setId: 101,
                reps: 10,
                weight: 100,
                volume: 1000,
                isWarmup: 0, // SQLite boolean: 0 = false
                rpe: 8,
                time: null,
              },
            ]),
          };
        }
        return { all: vi.fn(() => []) };
      }),
    };
    vi.mocked(getDb).mockReturnValue(mockDb as any);

    const result = getWorkoutDetail(1);
    expect(result!.exercises[0].sets[0].isWarmup).toBe(true);
    expect(result!.exercises[0].sets[1].isWarmup).toBe(false);
  });

  it('handles exercises with no sets', () => {
    const mockDb = {
      prepare: vi.fn((query: string) => {
        if (query.includes('FROM ZWORKOUTRESULT')) {
          return {
            get: vi.fn(() => ({
              id: 1,
              routineName: 'Test',
              startDate: toCoreDataTimestamp(new Date()),
              endDate: null,
              duration: 3600,
              bodyweight: 80,
            })),
          };
        }
        if (query.includes('FROM ZEXERCISERESULT')) {
          return {
            all: vi.fn(() => [
              {
                exerciseId: 10,
                exerciseName: 'test_exercise',
                maxWeight: null,
                volume: 0,
                muscles: null,
                secondaryMuscles: null,
                isUserCreated: 0,
              },
            ]),
          };
        }
        if (query.includes('FROM ZGYMSETRESULT')) {
          return { all: vi.fn(() => []) }; // No sets
        }
        return { all: vi.fn(() => []) };
      }),
    };
    vi.mocked(getDb).mockReturnValue(mockDb as any);

    const result = getWorkoutDetail(1);
    expect(result!.exercises[0].sets).toEqual([]);
  });
});
