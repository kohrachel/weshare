/**
 Contributors
 Rachel Huiqi: 2 hours
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
