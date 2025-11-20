import { format, parseISO } from "date-fns";
import { noop } from "./utils";

/**
 * Format ISO date string to human-readable format
 * Example: "Nov 19, 2024"
 */
export function formatDate(isoDate: string): string {
  try {
    const date = parseISO(isoDate);
    return format(date, "MMM d, yyyy");
  } catch (error) {
    return isoDate;
  }
}

/**
 * Format ISO date string to include time
 * Example: "Monday, Nov 19, 2024 at 6:30 AM"
 */
export function formatDateTime(isoDate: string): string {
  try {
    const date = parseISO(isoDate);
    return format(date, "EEEE, MMM d, yyyy 'at' h:mm a");
  } catch (error) {
    return isoDate;
  }
}

/**
 * Format duration in seconds to human-readable string
 * Example: "45 minutes"
 */
export function formatDuration(seconds: number): string {
  return `${Math.floor(seconds / 60)} minutes`;
}

/**
 * Convert kg to lbs
 * Used for individual weights, max weights, bodyweight, and volume
 * Note: Uses 2.2 ratio to match the app's storage format
 * Example: 100 kg -> "220 lbs"
 */
export function formatWeight(
  kg: number,
  options: { rounded: boolean }
): string {
  let op = options?.rounded ? Math.round : noop;
  return `${op(kg * 2.2)} lbs`;
}

/**
 * Format muscle name by splitting camelCase and capitalizing each word
 * Example: "upperBack" -> "Upper Back", "lats" -> "Lats"
 */
export function formatMuscleName(name: string): string {
  // Split on capital letters: "upperBack" -> ["upper", "Back"]
  return name
    .replace(/([A-Z])/g, " $1") // Insert space before capitals
    .trim() // Remove leading space
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Suffix words that should be wrapped in parentheses when formatting exercise names
 * e.g., "decline_crunch_weighted" -> "Decline Crunch (Weighted)"
 */
const PARENTHETICAL_SUFFIXES = ["weighted", "assisted"] as const;

/**
 * Format exercise name from snake_case to Title Case
 * Only for built-in exercises (e.g., "barbell_curl" -> "Barbell Curl")
 * Handles hyphenated words (e.g., "iso-lateral_chest_press" -> "Iso-Lateral Chest Press")
 * Wraps certain suffix words in parentheses (e.g., "decline_crunch_weighted" -> "Decline Crunch (Weighted)")
 *
 * @param name - The snake_case exercise name to format
 */
export function formatExerciseName(name: string): string {
  const words = name.split("_");

  // Check if last word should be wrapped in parentheses
  const lastWord = words[words.length - 1]?.toLowerCase();
  const shouldWrapLast =
    lastWord && PARENTHETICAL_SUFFIXES.includes(lastWord as any);

  const formattedWords = words.map((word, index) => {
    // Handle hyphenated words (e.g., "iso-lateral")
    const formatted = word
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join("-");

    // Wrap last word in parentheses if it's in the suffix list
    if (shouldWrapLast && index === words.length - 1) {
      return `(${formatted})`;
    }

    return formatted;
  });

  return formattedWords.join(" ");
}
