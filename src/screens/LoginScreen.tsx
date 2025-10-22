// src/screens/LoginScreen.tsx
import React, { useCallback, useMemo, useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../hooks";
import { Input } from "../components";
import { CommonException, ErrorCode, StatusCode } from "../utils/error";
import { globalStyles, colors } from "../styles";
import { typography, spacing, borderRadius, touchTargets } from "../utils/dimensions";
import { getResponsiveValue } from "..";

type FieldErrors = {
  usr?: string | null;
  pwd?: string | null;
};

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { login, ping, isLoggedIn } = useAuth();
  const authLogin = login; // Alias cho rõ ràng
  const [usr, setUsr] = useState("");
  const [pwd, setPwd] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<{ usr: boolean; pwd: boolean }>({ usr: false, pwd: false });
  const [formErr, setFormErr] = useState<string | null>(null);

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

  // ----- Auto-fill detection -----
  useEffect(() => {
    // Tự động xử lý validation khi có giá trị (auto-fill)
    if (usr.trim()) {
      if (!touched.usr) {
        setTouched((prev) => ({ ...prev, usr: true }));
      }
      // Xóa lỗi validation nếu field có giá trị hợp lệ
      const usrError = validateUsr(usr);
      if (!usrError && errors.usr) {
        setErrors((prev) => ({ ...prev, usr: null }));
      }
    }
    if (pwd) {
      if (!touched.pwd) {
        setTouched((prev) => ({ ...prev, pwd: true }));
      }
      // Xóa lỗi validation nếu field có giá trị hợp lệ
      const pwdError = validatePwd(pwd);
      if (!pwdError && errors.pwd) {
        setErrors((prev) => ({ ...prev, pwd: null }));
      }
    }
  }, [usr, pwd, touched.usr, touched.pwd, validateUsr, validatePwd, errors.usr, errors.pwd]);

  // ----- Auto redirect nếu đã đăng nhập -----
  useEffect(() => {
    if (isLoggedIn) {
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    }
  }, [isLoggedIn, navigation]);

  const validateAll = useCallback(
    (u: string, p: string) => {
      const next: FieldErrors = {
        usr: validateUsr(u),
        pwd: validatePwd(p),
      };
      setErrors(next);
      return !next.usr && !next.pwd;
    },
    [validateUsr, validatePwd]
  );

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
      const res = await authLogin(usr.trim(), pwd);
      if (!res.ok) {
        const error = res.status === StatusCode.UNAUTHORIZED || res.status === 401
          ? new CommonException(ErrorCode.WRONG_PASSWORD)
          : new CommonException(ErrorCode.UNKNOWN_ERROR);
        setFormErr(error.userMessage);
        return;
      }
      // Không cần điều hướng thủ công, useEffect sẽ tự động điều hướng khi isLoggedIn = true
    } finally {
      setLoginLoading(false);
    }
  }, [usr, pwd, validateAll, authLogin]);

  const onPing = useCallback(async () => {
    setFormErr(null);
    try {
      await ping(); // Gọi ping từ hook
      Alert.alert("SUCCESS", "Kết nối thành công!");
    } catch (e: any) {
      Alert.alert("ERROR", e?.message || "Không thể kết nối");
    }
  }, [ping]);

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
        <Text style={[globalStyles.responsiveTitle, styles.title]}>REMAK Login</Text>

        <Input
          value={usr}
          onChangeText={onChangeUsr}
          onBlur={onBlurUsr}
          placeholder="Username hoặc Email"
          autoCapitalize="none"
          textContentType="username"
        />
        {showUsrErr && <Text style={[globalStyles.responsiveText, styles.fieldError]}>{errors.usr}</Text>}

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
        {showPwdErr && <Text style={[globalStyles.responsiveText, styles.fieldError]}>{errors.pwd}</Text>}

        <Pressable
          style={[globalStyles.responsiveButton, styles.btn, loginLoading && styles.btnDisabled]}
          onPress={onSubmit}
          disabled={loginLoading}
          accessibilityRole="button"
        >
          {loginLoading ? <ActivityIndicator /> : <Text style={[globalStyles.responsiveText, styles.btnText]}>Đăng nhập</Text>}
        </Pressable>

        {!!formErr && <Text style={[globalStyles.responsiveText, styles.formError]}>{formErr}</Text>}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingHorizontal: getResponsiveValue({
      xs: spacing.md,
      sm: spacing.lg,
      md: spacing.xl,
      lg: spacing['2xl'],
    }),
    paddingVertical: getResponsiveValue({
      xs: spacing.sm,
      sm: spacing.md,
      md: spacing.lg,
      lg: spacing.xl,
    }),
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  title: { 
    fontSize: getResponsiveValue({
      xs: typography.xl,
      sm: typography['2xl'],
      md: typography['3xl'],
      lg: typography['4xl'],
    }),
    fontWeight: "700", 
    textAlign: "center", 
    marginBottom: getResponsiveValue({
      xs: spacing.md,
      sm: spacing.lg,
      md: spacing.xl,
      lg: spacing['2xl'],
    }),
    color: colors.textPrimary,
    lineHeight: getResponsiveValue({
      xs: typography.xl * 1.2,
      sm: typography['2xl'] * 1.2,
      md: typography['3xl'] * 1.1,
      lg: typography['4xl'] * 1.1,
    }),
  },
  btn: {
    backgroundColor: colors.black,
    paddingVertical: getResponsiveValue({
      xs: spacing.xs,
      sm: spacing.sm,
      md: spacing.md,
      lg: spacing.lg,
    }),
    paddingHorizontal: getResponsiveValue({
      xs: spacing.md,
      sm: spacing.lg,
      md: spacing.xl,
      lg: spacing['2xl'],
    }),
    borderRadius: getResponsiveValue({
      xs: borderRadius.sm,
      sm: borderRadius.md,
      md: borderRadius.lg,
      lg: borderRadius.xl,
    }),
    alignItems: "center",
    marginTop: getResponsiveValue({
      xs: spacing.md,
      sm: spacing.lg,
      md: spacing.xl,
      lg: spacing['2xl'],
    }),
    minHeight: getResponsiveValue({
      xs: touchTargets.small,
      sm: touchTargets.medium,
      md: touchTargets.large,
      lg: touchTargets.xl,
    }),
    justifyContent: "center",
  },
  btnDisabled: { 
    opacity: 0.6,
    backgroundColor: colors.gray600,
  },
  btnText: { 
    color: colors.white, 
    fontWeight: "600",
    fontSize: getResponsiveValue({
      xs: typography.xs,
      sm: typography.sm,
      md: typography.base,
      lg: typography.md,
    }),
  },
  fieldError: { 
    color: colors.error, 
    marginTop: getResponsiveValue({
      xs: spacing.xs,
      sm: spacing.sm,
      md: spacing.md,
      lg: spacing.lg,
    }),
    marginBottom: getResponsiveValue({
      xs: spacing.xs,
      sm: spacing.sm,
      md: spacing.md,
      lg: spacing.lg,
    }),
    fontSize: getResponsiveValue({
      xs: typography.xs,
      sm: typography.sm,
      md: typography.base,
      lg: typography.md,
    }),
  },
  formError: { 
    color: colors.error, 
    textAlign: "center", 
    marginTop: getResponsiveValue({
      xs: spacing.sm,
      sm: spacing.md,
      md: spacing.lg,
      lg: spacing.xl,
    }),
    fontSize: getResponsiveValue({
      xs: typography.xs,
      sm: typography.sm,
      md: typography.base,
      lg: typography.md,
    }),
  },
});
