import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLogin } from "../hooks/useLogin";
import { ping } from "../api/auth.api";
import Input from "../ui/Input";

export default function LoginScreen() {
  const [usr, setUsr] = useState("");
  const [pwd, setPwd] = useState("");
  const { doLogin, loading, error } = useLogin({
    onSuccess: (res) => Alert.alert("LOGIN JSON", JSON.stringify(res?.loginData ?? res, null, 2)),
  });

  const onSubmit = async () => {
    if (!usr || !pwd) return Alert.alert("Thiếu thông tin", "Vui lòng nhập đủ tài khoản và mật khẩu");
    await doLogin(usr, pwd);
  };

  const onPing = async () => {
    try {
      const data = await ping();
      Alert.alert("Ping OK", JSON.stringify(data));
    } catch (e: any) {
      Alert.alert("Ping lỗi", e?.message || "Không gọi được ping");
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.container}>
        <Text style={styles.title}>ERPNext Login</Text>

        <Input value={usr} onChangeText={setUsr} placeholder="Username hoặc Email" />
        <Input value={pwd} onChangeText={setPwd} placeholder="Mật khẩu" secureTextEntry />

        {!!error && <Text style={styles.error}>{error}</Text>}

        <Pressable style={[styles.btn, loading && styles.btnDisabled]} onPress={onSubmit} disabled={loading}>
          {loading ? <ActivityIndicator /> : <Text style={styles.btnText}>Đăng nhập</Text>}
        </Pressable>

        <Pressable style={[styles.btn, { backgroundColor: "#334155" }]} onPress={onPing}>
          <Text style={styles.btnText}>Test Server (Ping)</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", textAlign: "center", marginBottom: 16 },
  btn: { backgroundColor: "black", padding: 14, borderRadius: 10, alignItems: "center", marginTop: 4 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "white", fontWeight: "700" },
  error: { color: "#dc2626", marginBottom: 8 },
});
