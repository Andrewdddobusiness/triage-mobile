import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { supabase } from "~/lib/supabase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF231F7C",
  });
}

export async function registerForPushNotifications({
  serviceProviderId,
  authUserId,
}: {
  serviceProviderId?: string | null;
  authUserId?: string | null;
}) {
  await ensureAndroidChannel();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  const tokenData = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  );
  const token = tokenData.data;

  if (serviceProviderId && authUserId) {
    try {
      await supabase
        .from("push_tokens")
        .upsert({ service_provider_id: serviceProviderId, auth_user_id: authUserId, token, platform: Platform.OS });
    } catch (err) {
      console.error("Failed to upsert push token", err);
    }
  }

  return token;
}

export function addNotificationResponseListener(onNavigate: (data: Record<string, any>) => void) {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data as Record<string, any>;
    onNavigate(data);
  });
  return () => subscription.remove();
}
