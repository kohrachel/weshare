/**
 Contributors
 Rachel Huiqi: 1 hour
 */

/**
 * Formats a Date object into a string (e.g., "MM/DD/YYYY").
 * If no date is provided, it defaults to the current date.
 * @param {Date} date The date to format.
 * @returns {string} The formatted date string.
 */
export const formatDate = (date: Date) => {
  if (!date) {
    date = new Date();
  }
  return date.toLocaleDateString([], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
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
