import React from "react";
import { TextInput, StyleSheet, TextInputProps } from "react-native";

type Props = TextInputProps & { errorText?: string };

export default function Input({ style, ...rest }: Props) {
  return (
    <TextInput
      {...rest}
      style={[styles.input, style]}
      autoCapitalize={rest.autoCapitalize ?? "none"}
      autoCorrect={rest.autoCorrect ?? false}
      placeholderTextColor="#94a3b8"
      returnKeyType={rest.returnKeyType ?? "done"}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
});
