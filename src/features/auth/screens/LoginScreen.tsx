import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "../../../(app)/providers";
import { ping } from "../services/authService";
import Input from "../ui/Input";
import { ERROR_DEFS, AppErrorCode, StatusCode } from "../../../shared/errors/Error";

type FieldErrors = {
  usr?: string | null;
  pwd?: string | null;
};

export default function LoginScreen() {
  const [usr, setUsr] = useState("");
  const [pwd, setPwd] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<{ usr: boolean; pwd: boolean }>({ usr: false, pwd: false });
  const [formErr, setFormErr] = useState<string | null>(null);

  const { login } = useAuth();
  const [loginLoading, setLoginLoading] = useState(false);

  // ----- Validation -----
  const validateUsr = useCallback((value: string) => {
    if (!value.trim()) return "Vui lòng nhập tài khoản hoặc email";
    return null;
  }, []);

  const validatePwd = useCallback((value: string) => {
    if (!value) return "Vui lòng nhập mật khẩu";
    return null;
  }, []);

  const validateAll = useCallback(
    (u: string, p: string) => {
      const next: FieldErrors = {
        usr: validateUsr(u),
        pwd: validatePwd(p),
      };
      setErrors(next);
      // Hợp lệ khi tất cả đều null
      return !next.usr && !next.pwd;
    },
    [validateUsr, validatePwd]
  );

  // ----- Handlers -----
  const onChangeUsr = useCallback(
    (text: string) => {
      setUsr(text);
      if (touched.usr) {
        setErrors((prev) => ({ ...prev, usr: validateUsr(text) }));
      }
      if (formErr) setFormErr(null);
    },
    [touched.usr, validateUsr, formErr]
  );

  const onChangePwd = useCallback(
    (text: string) => {
      setPwd(text);
      if (touched.pwd) {
        setErrors((prev) => ({ ...prev, pwd: validatePwd(text) }));
      }
      if (formErr) setFormErr(null);
    },
    [touched.pwd, validatePwd, formErr]
  );

  const onBlurUsr = useCallback(() => {
    setTouched((t) => ({ ...t, usr: true }));
    setErrors((prev) => ({ ...prev, usr: validateUsr(usr) }));
  }, [usr, validateUsr]);

  const onBlurPwd = useCallback(() => {
    setTouched((t) => ({ ...t, pwd: true }));
    setErrors((prev) => ({ ...prev, pwd: validatePwd(pwd) }));
  }, [pwd, validatePwd]);

  const onSubmit = useCallback(async () => {
    setFormErr(null);
    setTouched({ usr: true, pwd: true });
    const ok = validateAll(usr, pwd);
    if (!ok) return;
    setLoginLoading(true);
    try {
      const res = await login(usr.trim(), pwd);
      if (!res.ok) {
        const uiMsg =
          res.status === StatusCode.UNAUTHORIZED || res.status === 401
            ? ERROR_DEFS[AppErrorCode.INVALID_CREDENTIALS].uiMessage
            : (ERROR_DEFS[res.error]?.uiMessage ??
                ERROR_DEFS[AppErrorCode.UNKNOWN].uiMessage);
        setFormErr(uiMsg);
        // Không reset usr/pwd, không reload, chỉ báo lỗi
        return;
      }
      // Thành công: AuthProvider sẽ chuyển hướng, không cần reset form
    } finally {
      setLoginLoading(false);
    }
  }, [usr, pwd, login, validateAll]);

  const onPing = useCallback(async () => {
    setFormErr(null);
    try {
      await ping();
    } catch (e: any) {
      setFormErr(e?.message || "Không gọi được ping");
    }
  }, []);

  // Chỉ hiện lỗi khi field đã touched hoặc khi form đã báo lỗi do submit
  const showUsrErr = useMemo(
    () => (touched.usr || !!errors.usr) && !!errors.usr,
    [touched.usr, errors.usr]
  );
  const showPwdErr = useMemo(
    () => (touched.pwd || !!errors.pwd) && !!errors.pwd,
    [touched.pwd, errors.pwd]
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <Text style={styles.title}>ERPNext Login</Text>

        <Input
          value={usr}
          onChangeText={onChangeUsr}
          onBlur={onBlurUsr}
          placeholder="Username hoặc Email"
          autoCapitalize="none"
          textContentType="username"
        />
        {showUsrErr && <Text style={styles.fieldError}>{errors.usr}</Text>}

        <Input
          value={pwd}
          onChangeText={onChangePwd}
          onBlur={onBlurPwd}
          placeholder="Mật khẩu"
          secureTextEntry
          secureToggle
          autoCapitalize="none"
          textContentType="password"
        />
        {showPwdErr && <Text style={styles.fieldError}>{errors.pwd}</Text>}

        <Pressable
          style={[styles.btn, loginLoading && styles.btnDisabled]}
          onPress={onSubmit}
          disabled={loginLoading}
          accessibilityRole="button"
        >
          {loginLoading ? <ActivityIndicator /> : <Text style={styles.btnText}>Đăng nhập</Text>}
        </Pressable>

        {!!formErr && <Text style={styles.formError}>{formErr}</Text>}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", textAlign: "center", marginBottom: 16 },
  btn: {
    backgroundColor: "black",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 24,
  },
  btnSecondary: { backgroundColor: "#334155" },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "white", fontWeight: "700" },
  fieldError: { color: "#dc2626", marginTop: 6, marginBottom: 4 },
  formError: { color: "#dc2626", textAlign: "center", marginTop: 12 },
});
