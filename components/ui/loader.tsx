import React from "react";
import { ActivityIndicator, ActivityIndicatorProps } from "react-native";
import { palette } from "~/lib/theme";

type LoaderProps = ActivityIndicatorProps & {
  color?: string;
};

export function Loader({ color = palette.primary, size = "large", ...rest }: LoaderProps) {
  return <ActivityIndicator color={color} size={size} {...rest} />;
}
