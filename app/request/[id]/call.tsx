import React, { useEffect } from "react";
import { View, Text, Pressable, StyleSheet, SafeAreaView } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useTwilio } from "~/lib/hooks/useTwilio";
import { Pause, Volume2, MicOff, PhoneOff, UserSquare2, MessageSquare, ClipboardEdit } from "lucide-react-native";
import { useSession } from "~/lib/auth/ctx";
import { useCustomerInquiries } from "~/stores/customerInquiries";

export default function CallScreen() {
  const { id } = useLocalSearchParams();
  const { session } = useSession();
  const { inquiries } = useCustomerInquiries();
  const inquiry = inquiries.find((i) => i.id === id);

  const { makeCall, hangup, isConnected, callStatus, toggleMute, toggleSpeaker, toggleHold } = useTwilio(
    session?.user?.email || "anonymous"
  );

  useEffect(() => {
    if (inquiry?.phone) {
      makeCall(inquiry.phone);
    }
  }, [inquiry?.phone]);

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Active call from Melbourne VIC</Text>
        <Text style={styles.subHeaderText}>{inquiry?.phone || "Unknown"}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{inquiry?.name ? getInitials(inquiry.name) : "??"}</Text>
        </View>
        <Text style={styles.name}>{inquiry?.name || "Unknown"}</Text>
        <Text style={styles.timer}>00:03</Text>

        <View style={styles.actions}>
          <Pressable style={styles.actionButton}>
            <UserSquare2 size={24} color="#fff" />
            <Text style={styles.actionText}>Profile</Text>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <MessageSquare size={24} color="#fff" />
            <Text style={styles.actionText}>Text</Text>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <ClipboardEdit size={24} color="#fff" />
            <Text style={styles.actionText}>Note</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable style={styles.controlButton} onPress={toggleHold}>
          <Pause size={24} color="#fff" />
          <Text style={styles.controlText}>Hold</Text>
        </Pressable>
        <Pressable style={styles.controlButton} onPress={toggleSpeaker}>
          <Volume2 size={24} color="#fff" />
          <Text style={styles.controlText}>Speaker</Text>
        </Pressable>
        <Pressable style={styles.controlButton} onPress={toggleMute}>
          <MicOff size={24} color="#fff" />
          <Text style={styles.controlText}>Mute</Text>
        </Pressable>
        <Pressable style={[styles.controlButton, styles.endButton]} onPress={hangup}>
          <PhoneOff size={24} color="#fff" />
          <Text style={styles.controlText}>End</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c1c1e",
  },
  header: {
    padding: 16,
  },
  headerText: {
    color: "#fff",
    fontSize: 16,
    opacity: 0.8,
  },
  subHeaderText: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.6,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 100,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#8b5cf6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "600",
  },
  name: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
  },
  timer: {
    color: "#fff",
    fontSize: 16,
    opacity: 0.6,
    marginBottom: 32,
  },
  actions: {
    flexDirection: "row",
    gap: 32,
  },
  actionButton: {
    alignItems: "center",
    gap: 8,
  },
  actionText: {
    color: "#fff",
    fontSize: 12,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    paddingBottom: 32,
    backgroundColor: "#2c2c2e",
  },
  controlButton: {
    alignItems: "center",
    gap: 8,
    backgroundColor: "#3a3a3c",
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
  },
  controlText: {
    color: "#fff",
    fontSize: 12,
  },
  endButton: {
    backgroundColor: "#ff3b30",
  },
});
