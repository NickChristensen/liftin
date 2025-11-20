import { describe, it, expect } from 'vitest';
import { cn, noop, roundToDecimals } from './utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', true && 'visible')).toBe('base visible');
  });

  it('merges Tailwind classes correctly', () => {
    // twMerge should deduplicate conflicting Tailwind classes
    expect(cn('px-2', 'px-4')).toBe('px-4'); // later class wins
  });

  it('handles arrays of classes', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2');
  });

  it('handles objects with conditional classes', () => {
    expect(cn({ 'class1': true, 'class2': false, 'class3': true }))
      .toBe('class1 class3');
  });

  it('handles mixed inputs', () => {
    expect(cn('base', ['array1', 'array2'], { conditional: true }))
      .toBe('base array1 array2 conditional');
  });

  it('handles empty inputs', () => {
    expect(cn()).toBe('');
    expect(cn('')).toBe('');
    expect(cn(null, undefined, false)).toBe('');
  });

  it('properly merges conflicting Tailwind utilities', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    expect(cn('text-sm', 'text-lg')).toBe('text-lg');
    expect(cn('p-4', 'px-2')).toBe('p-4 px-2'); // different properties
  });
});

describe('noop', () => {
  it('returns the input value unchanged', () => {
    expect(noop(5)).toBe(5);
    expect(noop('test')).toBe('test');
    expect(noop(null)).toBe(null);
    expect(noop(undefined)).toBe(undefined);
  });

  it('returns objects unchanged', () => {
    const obj = { a: 1, b: 2 };
    expect(noop(obj)).toBe(obj);
  });

  it('returns arrays unchanged', () => {
    const arr = [1, 2, 3];
    expect(noop(arr)).toBe(arr);
  });
});

describe('roundToDecimals', () => {
  it('rounds to zero decimals by default', () => {
    expect(roundToDecimals(5.4)).toBe(5);
    expect(roundToDecimals(5.5)).toBe(6);
    expect(roundToDecimals(5.6)).toBe(6);
  });

  it('rounds to specified decimal places', () => {
    expect(roundToDecimals(5.555, 1)).toBe(5.6);
    expect(roundToDecimals(5.555, 2)).toBe(5.56);
    expect(roundToDecimals(5.555, 3)).toBe(5.555);
  });

  it('handles negative numbers', () => {
    expect(roundToDecimals(-5.4, 0)).toBe(-5);
    expect(roundToDecimals(-5.5, 0)).toBe(-5); // Math.round rounds -5.5 toward zero to -5
    expect(roundToDecimals(-5.555, 2)).toBe(-5.55); // -5.555 rounded to 2 decimals
  });

  it('handles zero', () => {
    expect(roundToDecimals(0, 0)).toBe(0);
    expect(roundToDecimals(0, 2)).toBe(0);
  });

  it('handles whole numbers', () => {
    expect(roundToDecimals(10, 0)).toBe(10);
    expect(roundToDecimals(10, 2)).toBe(10);
  });

  it('handles very small numbers', () => {
    expect(roundToDecimals(0.0001, 3)).toBe(0);
    expect(roundToDecimals(0.001, 3)).toBe(0.001);
    expect(roundToDecimals(0.0015, 3)).toBe(0.002);
  });

  it('handles large numbers', () => {
    expect(roundToDecimals(123456.789, 0)).toBe(123457);
    expect(roundToDecimals(123456.789, 1)).toBe(123456.8);
    expect(roundToDecimals(123456.789, 2)).toBe(123456.79);
  });

  it('handles edge cases for rounding (0.5)', () => {
    expect(roundToDecimals(2.5, 0)).toBe(3); // rounds up
    expect(roundToDecimals(3.5, 0)).toBe(4); // rounds up
    expect(roundToDecimals(2.25, 1)).toBe(2.3); // rounds up
    expect(roundToDecimals(2.15, 1)).toBe(2.2); // rounds up
  });

  it('matches the weight conversion usage in formatWeight', () => {
    // formatWeight uses roundToDecimals(kg * 2.2, 1)
    expect(roundToDecimals(100 * 2.2, 1)).toBe(220.0);
    expect(roundToDecimals(50.23 * 2.2, 1)).toBe(110.5);
    expect(roundToDecimals(22.7 * 2.2, 1)).toBe(49.9);
  });
});
