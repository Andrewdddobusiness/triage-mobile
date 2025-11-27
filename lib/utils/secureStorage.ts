import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// In-memory fallback for platforms without SecureStore support (e.g., web/testing)
const memoryStore = new Map<string, string>();

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return memoryStore.get(key) ?? null;
    }

    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      memoryStore.set(key, value);
      return;
    }

    await SecureStore.setItemAsync(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      memoryStore.delete(key);
      return;
    }

    await SecureStore.deleteItemAsync(key);
  },
};
