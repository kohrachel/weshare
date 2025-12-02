/**
 Contributors
 Rachel Huiqi: 2 hours
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

export const formatTime = (time: Date) => {
  if (!time) {
    time = new Date();
  }
  return time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};
