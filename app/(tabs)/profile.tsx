import React from "react";
import { View, ScrollView, Image, Pressable } from "react-native";
import { Text } from "~/components/ui/text";
import { useSession } from "~/lib/auth/ctx";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProfileActionButton } from "~/components/ui/profile-action-button";
import { Settings, Crown, HelpCircle, MessageCircle, Pencil, LogOut, User } from "lucide-react-native";

export default function ProfileScreen() {
  const { signOut } = useSession();
  const insets = useSafeAreaInsets();

  // Mock user data
  const user = {
    name: "John Doe",
    username: "johndoe",
    profileImage: null,
    followers: 245,
    following: 168,
  };

  const defaultProfileImage = "https://ui-avatars.com/api/?name=" + user.name.replace(" ", "+");

  return (
    <ScrollView
      className="flex-1 bg-zinc-100"
      contentContainerStyle={{
        paddingBottom: insets.bottom + 80,
      }}
    >
      {/* Profile Header */}
      <View className="bg-white p-6 items-center">
        {/* Profile Image with Edit Button */}
        <View className="relative">
          {user.profileImage ? (
            <Image source={{ uri: user.profileImage }} className="w-24 h-24 rounded-full" />
          ) : (
            <View className="w-24 h-24 rounded-full bg-zinc-100 items-center justify-center">
              <User size={48} color="#94a3b8" />
            </View>
          )}
          <Pressable
            className="absolute bottom-0 right-0 bg-foreground rounded-full p-1"
            onPress={() => console.log("Edit profile photo")}
          >
            <Pencil size={16} color="white" />
          </Pressable>
        </View>

        {/* User Info */}
        <Text className="text-xl font-semibold mt-4">{user.name}</Text>
        <Text className="text-base text-muted-foreground">@{user.username}</Text>

        {/* Followers/Following */}
        <View className="flex-row gap-8 mt-4">
          <View className="items-center">
            <Text className="text-lg font-semibold">{user.followers}</Text>
            <Text className="text-sm text-muted-foreground">Followers</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-semibold">{user.following}</Text>
            <Text className="text-sm text-muted-foreground">Following</Text>
          </View>
        </View>
      </View>

      {/* Actions List */}
      <View className="mt-4 space-y-px">
        <ProfileActionButton
          label="Settings"
          icon={<Settings size={20} color="#64748b" />}
          onPress={() => console.log("Settings pressed")}
        />

        <ProfileActionButton
          label="Help & Info"
          icon={<HelpCircle size={20} color="#64748b" />}
          onPress={() => console.log("Help pressed")}
        />
        <ProfileActionButton
          label="Feedback & Support"
          icon={<MessageCircle size={20} color="#64748b" />}
          onPress={() => console.log("Support pressed")}
        />
        <ProfileActionButton
          label="Sign Out"
          icon={<LogOut size={20} color="#ef4444" />}
          onPress={signOut}
          variant="destructive"
        />
      </View>
    </ScrollView>
  );
}
