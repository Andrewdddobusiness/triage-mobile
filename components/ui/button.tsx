import React from "react";
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle } from "react-native";
import { palette, radii, shadows } from "~/lib/theme";

type Variant = "primary" | "secondary" | "ghost" | "destructive";

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: Variant;
  style?: ViewStyle;
}

export function Button({ children, onPress, disabled, loading, variant = "primary", style }: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        isDisabled && styles.disabled,
        { transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "secondary" || variant === "ghost" ? palette.text : "#fff"} />
      ) : (
        <Text style={[styles.label, labelStyles[variant], isDisabled && styles.disabledLabel]}>{children}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radii.button,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.6,
  },
  disabledLabel: {
    color: palette.textMuted,
  },
});

const variantStyles: Record<Variant, ViewStyle> = {
  primary: {
    backgroundColor: palette.primary,
  },
  secondary: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  destructive: {
    backgroundColor: palette.danger,
  },
};

const labelStyles: Record<Variant, { color: string }> = {
  primary: { color: "#fff" },
  secondary: { color: palette.text },
  ghost: { color: palette.text },
  destructive: { color: "#fff" },
};
