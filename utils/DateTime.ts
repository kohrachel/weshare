/**
 Contributors
 Rachel Huiqi: 2 hours
 */

/**
 * Formats a Date object into a short date string (e.g., "Sep 26").
 * If no date is provided, it defaults to the current date.
 * @param {Date} date The date to format.
 * @returns {string} The formatted short date string.
 */
export const formatDateShort = (date: Date) => {
  if (!date) {
    date = new Date();
  }
  return date.toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });
};

/**
 * Formats a Date object into a time string (e.g., "HH:MM AM/PM").
 * If no time is provided, it defaults to the current time.
 * @param {Date} time The date object containing the time to format.
 * @returns {string} The formatted time string.
 */
export const formatTime = (time: Date) => {
  if (!time) {
    time = new Date();
  }
  return time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};
