// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useAuth } from "../(app)/providers/AuthProvider";
import { getSid } from "../api/erp.api";

function maskSid(sid: string | null) {
  if (!sid) return "(no sid)";
  return sid.length > 12 ? `${sid.slice(0,6)}...${sid.slice(-4)}` : sid;
}

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [sid, setSid] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const s = await getSid();
      setSid(s);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Xin chào, {user || "User"} 👋</Text>
      <Text style={styles.subtitle}>Bạn đã đăng nhập ERPNext thành công.</Text>

      <View style={styles.sidBox}>
        <Text style={styles.sidLabel}>SID</Text>
        <Text style={styles.sidValue}>{maskSid(sid)}</Text>
      </View>

      <Pressable style={styles.btn} onPress={logout}>
        <Text style={styles.btnText}>Đăng xuất</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 10, padding: 20, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#666" },
  sidBox: { marginTop: 12, padding: 10, borderRadius: 8, backgroundColor: "#0f172a" },
  sidLabel: { color: "#94a3b8", fontSize: 12, marginBottom: 4 },
  sidValue: { color: "white", fontWeight: "700" },
  btn: { marginTop: 16, backgroundColor: "#ef4444", padding: 12, borderRadius: 10 },
  btnText: { color: "white", fontWeight: "700" },
});
