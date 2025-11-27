import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Alert, Platform } from "react-native";
import { notify } from "./notify";

let hasAcknowledgedWarning = false;

export async function copySensitiveToClipboard(value: string, label: string): Promise<boolean> {
  if (!value) return false;

  const performCopy = async () => {
    await Clipboard.setStringAsync(value);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Haptics may not be available; ignore
    }
    if (Platform.OS === "android") {
      notify(`${label} copied. Treat it as sensitive.`);
    }
    return true;
  };

  if (hasAcknowledgedWarning) {
    return performCopy();
  }

  return new Promise((resolve) => {
    Alert.alert(
      "Copy sensitive info?",
      `${label} will be placed on your clipboard. Clear it after use if you're on a shared device.`,
      [
        { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
        {
          text: "Copy",
          onPress: async () => {
            hasAcknowledgedWarning = true;
            const result = await performCopy();
            resolve(result);
          },
        },
      ]
    );
  });
}
