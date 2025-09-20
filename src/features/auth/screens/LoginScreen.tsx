  // src/screens/LoginScreen.tsx
  import React, { useState } from "react";
  import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { useAuth } from "../../../(app)/providers";     // dùng barrel: src/(app)/providers/index.ts
import { pingERP } from "../../../api/erpClient";

  function safeStringify(obj: any, space = 2, maxLen = 4000) {
    try {
      const s = JSON.stringify(obj, null, space);
      return s.length > maxLen ? s.slice(0, maxLen) + " ...[truncated]" : s;
    } catch {
      return String(obj);
    }
  }

  export default function LoginScreen() {
    const { isLoading, login } = useAuth();
    const [usr, setUsr] = useState("");
    const [pwd, setPwd] = useState("");

  const onSubmit = async () => {
    try {
      if (!usr || !pwd) {
        Alert.alert("Thiếu thông tin", "Vui lòng nhập đủ tài khoản và mật khẩu");
        return;
      }
      const res = await login(usr, pwd);
      // ✅ In ra đúng JSON ERPNext trả về
      Alert.alert("LOGIN JSON", safeStringify(res?.loginData));
      // (tuỳ chọn) cũng log ra console cho dễ debug
      console.log("LOGIN JSON", res?.loginData);
    } catch (e: any) {
      const payload = e?.response
        ? {
            status: e.response.status,
            statusText: e.response.statusText,
            headers: e.response.headers,
            data: e.response.data,
          }
        : { message: e?.message || String(e) };
      Alert.alert("Đăng nhập thất bại", safeStringify(payload));
    }
  };

    const onPing = async () => {
      try {
        const data = await pingERP();
        Alert.alert("Ping OK", JSON.stringify(data));
      } catch (e: any) {
        Alert.alert("Ping lỗi", e?.message || "Không gọi được /api/method/ping");
      }
    };

    return (
      <View style={styles.container}>
        <Text style={styles.title}>ERPNext Login</Text>
        <TextInput style={styles.input} placeholder="Username hoặc Email" autoCapitalize="none" value={usr} onChangeText={setUsr}/>
        <TextInput style={styles.input} placeholder="Mật khẩu" secureTextEntry value={pwd} onChangeText={setPwd}/>

        <Pressable style={styles.btn} onPress={onSubmit} disabled={isLoading}>
          {isLoading ? <ActivityIndicator /> : <Text style={styles.btnText}>Đăng nhập</Text>}
        </Pressable>

        <Pressable style={[styles.btn, { backgroundColor: "#334155" }]} onPress={onPing}>
          <Text style={styles.btnText}>Test Server (Ping)</Text>
        </Pressable>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: { flex: 1, gap: 12, padding: 20, justifyContent: "center" },
    title: { fontSize: 24, fontWeight: "700", textAlign: "center", marginBottom: 12 },
    input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12 },
    btn: { backgroundColor: "black", padding: 14, borderRadius: 10, alignItems: "center" },
    btnText: { color: "white", fontWeight: "700" }
  });
