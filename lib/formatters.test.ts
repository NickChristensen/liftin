import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatDuration,
  formatWeight,
  formatMuscleName,
  formatExerciseName,
} from './formatters';

describe('formatDate', () => {
  it('formats ISO date string correctly', () => {
    expect(formatDate('2024-11-19T12:00:00.000Z')).toBe('Nov 19, 2024');
  });

  it('handles different months', () => {
    expect(formatDate('2024-01-15T12:00:00.000Z')).toBe('Jan 15, 2024');
    expect(formatDate('2024-12-31T12:00:00.000Z')).toBe('Dec 31, 2024');
  });

  it('returns original string for invalid date', () => {
    expect(formatDate('invalid-date')).toBe('invalid-date');
  });

  it('handles edge cases', () => {
    expect(formatDate('2024-02-29T12:00:00.000Z')).toBe('Feb 29, 2024'); // leap year
    // Note: Date parsing is timezone-dependent, test may vary by environment
    const result = formatDate('2000-01-01T00:00:00.000Z');
    expect(['Dec 31, 1999', 'Jan 1, 2000']).toContain(result);
  });
});

describe('formatDateTime', () => {
  it('formats ISO date string with time correctly', () => {
    const result = formatDateTime('2024-11-19T06:30:00.000Z');
    expect(result).toMatch(/Tuesday, Nov 19, 2024 at \d{1,2}:\d{2} [AP]M/);
  });

  it('handles AM/PM correctly', () => {
    const morning = formatDateTime('2024-11-19T06:30:00.000Z');
    expect(morning).toContain('AM');
  });

  it('returns original string for invalid date', () => {
    expect(formatDateTime('invalid-date')).toBe('invalid-date');
  });

  it('handles midnight and noon', () => {
    // Note: Date parsing is timezone-dependent
    const midnight = formatDateTime('2024-11-19T00:00:00.000Z');
    expect(midnight).toContain('2024');
  });
});

describe('formatDuration', () => {
  it('formats duration in seconds to minutes', () => {
    expect(formatDuration(2700)).toBe('45 minutes'); // 45 * 60
  });

  it('handles whole minutes', () => {
    expect(formatDuration(60)).toBe('1 minutes');
    expect(formatDuration(3600)).toBe('60 minutes');
  });

  it('floors partial minutes', () => {
    expect(formatDuration(90)).toBe('1 minutes'); // 1.5 minutes -> 1
    expect(formatDuration(59)).toBe('0 minutes'); // 0.98 minutes -> 0
  });

  it('handles zero duration', () => {
    expect(formatDuration(0)).toBe('0 minutes');
  });

  it('handles large durations', () => {
    expect(formatDuration(7200)).toBe('120 minutes'); // 2 hours
  });
});

describe('formatWeight', () => {
  it('converts kg to lbs with 2.2 ratio', () => {
    expect(formatWeight(100)).toBe('220 lbs');
  });

  it('rounds to one decimal place', () => {
    expect(formatWeight(45.5)).toBe('100.1 lbs'); // 45.5 * 2.2 = 100.1
    expect(formatWeight(50.23)).toBe('110.5 lbs'); // 50.23 * 2.2 = 110.506 -> 110.5
  });

  it('handles zero weight', () => {
    expect(formatWeight(0)).toBe('0 lbs');
  });

  it('handles small weights', () => {
    expect(formatWeight(1)).toBe('2.2 lbs');
    expect(formatWeight(0.5)).toBe('1.1 lbs');
  });

  it('handles large weights', () => {
    expect(formatWeight(200)).toBe('440 lbs');
  });

  it('handles decimal inputs', () => {
    expect(formatWeight(22.7)).toBe('49.9 lbs'); // 22.7 * 2.2 = 49.94 -> 49.9
  });
});

describe('formatMuscleName', () => {
  it('formats camelCase to Title Case', () => {
    expect(formatMuscleName('upperBack')).toBe('Upper Back');
  });

  it('handles single word names', () => {
    expect(formatMuscleName('lats')).toBe('Lats');
    expect(formatMuscleName('chest')).toBe('Chest');
  });

  it('handles multiple capital letters', () => {
    expect(formatMuscleName('lowerBackSpinalErectors')).toBe('Lower Back Spinal Erectors');
  });

  it('handles all lowercase', () => {
    expect(formatMuscleName('biceps')).toBe('Biceps');
  });

  it('handles already capitalized names', () => {
    expect(formatMuscleName('Chest')).toBe('Chest');
  });
});

describe('formatExerciseName', () => {
  it('formats snake_case to Title Case', () => {
    expect(formatExerciseName('barbell_curl')).toBe('Barbell Curl');
  });

  it('handles hyphenated words', () => {
    expect(formatExerciseName('iso-lateral_chest_press')).toBe('Iso-Lateral Chest Press');
  });

  it('wraps "weighted" suffix in parentheses', () => {
    expect(formatExerciseName('decline_crunch_weighted')).toBe('Decline Crunch (Weighted)');
  });

  it('wraps "assisted" suffix in parentheses', () => {
    expect(formatExerciseName('pull_up_assisted')).toBe('Pull Up (Assisted)');
  });

  it('handles single word names', () => {
    expect(formatExerciseName('deadlift')).toBe('Deadlift');
  });

  it('handles multiple underscores', () => {
    expect(formatExerciseName('barbell_bench_press')).toBe('Barbell Bench Press');
  });

  it('does not wrap non-suffix words', () => {
    expect(formatExerciseName('weighted_sit_up')).toBe('Weighted Sit Up');
  });

  it('handles mixed case and hyphenation', () => {
    expect(formatExerciseName('t-bar_row')).toBe('T-Bar Row');
  });

  it('handles edge case with weighted at start', () => {
    expect(formatExerciseName('weighted_pull_up')).toBe('Weighted Pull Up');
  });

  it('is case insensitive for suffix detection', () => {
    expect(formatExerciseName('pull_up_WEIGHTED')).toBe('Pull Up (Weighted)');
    expect(formatExerciseName('pull_up_Assisted')).toBe('Pull Up (Assisted)');
  });
});
