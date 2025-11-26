import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "./button";
import { palette, radii, shadows } from "~/lib/theme";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={[styles.container, shadows.card]}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <Button variant="secondary" onPress={onAction} style={{ marginTop: 12, shadowOpacity: 0 }}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.text,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: palette.textMuted,
    textAlign: "center",
    marginTop: 6,
  },
});
