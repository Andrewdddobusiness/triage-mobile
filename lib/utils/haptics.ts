import * as Haptics from "expo-haptics";

const HAPTICS_ENABLED = process.env.EXPO_PUBLIC_HAPTICS_ENABLED !== "false";

export const haptics = {
  async success() {
    if (!HAPTICS_ENABLED) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      /* ignore */
    }
  },
  async error() {
    if (!HAPTICS_ENABLED) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {
      /* ignore */
    }
  },
  async impact(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) {
    if (!HAPTICS_ENABLED) return;
    try {
      await Haptics.impactAsync(style);
    } catch {
      /* ignore */
    }
  },
};
