import React, { forwardRef, useState } from "react";
import {
  View,
  TextInput as RNTextInput,
  TextInputProps,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = TextInputProps & {
  /** Bật nút 👁 để ẩn/hiện mật khẩu */
  secureToggle?: boolean;
};

const Input = forwardRef<RNTextInput, Props>(
  ({ secureToggle, secureTextEntry, style, ...props }, ref) => {
    // Mặc định: nếu có secureTextEntry thì bắt đầu ở trạng thái ẨN
    const [hidden, setHidden] = useState<boolean>(!!secureTextEntry);

    return (
      <View style={styles.wrap}>
        <RNTextInput
          ref={ref}
          {...props}
          autoCorrect={false}
          secureTextEntry={secureToggle ? hidden : secureTextEntry}
          placeholderTextColor="#94a3b8"
          style={[styles.input, secureToggle && styles.inputHasIcon, style]}
        />
        {secureToggle && (
          <Pressable
            onPress={() => setHidden(v => !v)}
            style={styles.eye}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Hiển thị mật khẩu" : "Ẩn mật khẩu"}
          >
            <Ionicons name={hidden ? "eye" : "eye-off"} size={18} />
          </Pressable>
        )}
      </View>
    );
  }
);

export default Input;

const styles = StyleSheet.create({
  wrap: { position: "relative", marginTop: 12 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    backgroundColor: "white",
  },
  inputHasIcon: { paddingRight: 44 }, // chừa chỗ cho icon mắt
  eye: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
});
