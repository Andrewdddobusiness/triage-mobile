import * as React from "react";
import { TextInput, TextInputProps } from "react-native";
import { cn } from "~/lib/utils";

interface InputProps extends TextInputProps {
  className?: string;
}

export const Input = React.forwardRef<TextInput, InputProps>(({ className, ...props }, ref) => {
  return (
    <TextInput
      ref={ref}
      className={cn("flex h-10 rounded-md border border-input bg-background px-3 text-foreground", className)}
      placeholderTextColor="#a1a1aa"
      style={{ fontSize: 14 }}
      {...props}
    />
  );
});

Input.displayName = "Input";
