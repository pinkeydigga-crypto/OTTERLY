export const triggerSubtleVibration = () => {
  // Check karein ki browser/device vibration API support karta hai ya nahi
  if (typeof window !== "undefined" && "navigator" in window && navigator.vibrate) {
    // 10ms se 15ms ka ek bohot mild minimal touch haptic response
    navigator.vibrate(12);
  }
};