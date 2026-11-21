import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { colors } from "../src/theme";
import { apiRequest } from "../src/api";

type AuthResult = { accessToken?: unknown; user: { id: string; username: string; displayName: string } };

export default function AuthScreen() {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    if (!email.trim() || !password) { setError("Заполни почту и пароль."); return; }
    if (mode === "register" && !name.trim()) { setError("Придумай имя пользователя."); return; }
    setBusy(true);
    try {
      const result = await apiRequest<AuthResult>(mode === "register" ? "/auth/register" : "/auth/login", {
        method: "POST",
        body: JSON.stringify(mode === "register"
          ? { email: email.trim(), username: name.trim().toLowerCase(), displayName: name.trim(), password }
          : { login: email.trim(), password }),
      });
      const token = typeof result?.accessToken === "string" ? result.accessToken : "";
      if (!token.trim()) {
        throw new Error("Сервер не вернул токен входа. Проверь, что Backend запущен и обновлён.");
      }
      await SecureStore.setItemAsync("reelix_access_token", token);
      router.replace("/(tabs)/feed");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось войти. Попробуй ещё раз.");
    } finally { setBusy(false); }
  }

  return (
    <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.header}>
        <Text style={styles.logo}>reel<Text style={styles.logoAccent}>ix</Text></Text>
        <Text style={styles.tagline}>Твои моменты. Твой мир.</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.switcher}>
          <Pressable onPress={() => { setMode("register"); setError(""); }} style={[styles.switchItem, mode === "register" && styles.switchActive]}>
            <Text style={[styles.switchText, mode === "register" && styles.switchTextActive]}>Регистрация</Text>
          </Pressable>
          <Pressable onPress={() => { setMode("login"); setError(""); }} style={[styles.switchItem, mode === "login" && styles.switchActive]}>
            <Text style={[styles.switchText, mode === "login" && styles.switchTextActive]}>Вход</Text>
          </Pressable>
        </View>
        <Text style={styles.title}>{mode === "register" ? "Создай свой аккаунт" : "С возвращением!"}</Text>
        <Text style={styles.description}>{mode === "register" ? "Присоединяйся к Reelix и делись моментами." : "Войди, чтобы продолжить пользоваться Reelix."}</Text>
        {mode === "register" && <TextInput value={name} onChangeText={setName} placeholder="Имя пользователя" placeholderTextColor={colors.muted} autoCapitalize="none" style={styles.input} />}
        <TextInput value={email} onChangeText={setEmail} placeholder={mode === "register" ? "Электронная почта" : "Почта или имя пользователя"} placeholderTextColor={colors.muted} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
        <TextInput value={password} onChangeText={setPassword} placeholder="Пароль (минимум 10 символов)" placeholderTextColor={colors.muted} secureTextEntry style={styles.input} />
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        <Pressable disabled={busy} style={[styles.primary, busy && styles.disabled]} onPress={submit}>
          {busy ? <ActivityIndicator color="#FFFFFF" /> : <><Text style={styles.primaryText}>{mode === "register" ? "Создать аккаунт" : "Войти"}</Text><Ionicons name="arrow-forward" size={18} color="#FFFFFF" /></>}
        </Pressable>
        <Text style={styles.note}>Пароль передаётся серверу по защищённому соединению и хранится в виде хеша.</Text>
      </View>
      <View style={styles.bottom}>
        <Text style={styles.bottomText}>Продолжая, ты соглашаешься с правилами Reelix.</Text>
        <Link href="/(tabs)/feed" style={styles.preview}>Посмотреть приложение</Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 22, justifyContent: "space-between" },
  header: { paddingTop: 58, alignItems: "center" },
  logo: { color: colors.text, fontSize: 38, fontWeight: "900", letterSpacing: -2 },
  logoAccent: { color: colors.violet },
  tagline: { color: colors.muted, fontSize: 13, marginTop: 5 },
  card: { width: "100%", maxWidth: 430, alignSelf: "center" },
  switcher: { flexDirection: "row", backgroundColor: colors.surface, padding: 4, marginBottom: 28 },
  switchItem: { flex: 1, paddingVertical: 12, alignItems: "center" },
  switchActive: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.line },
  switchText: { color: colors.muted, fontSize: 13, fontWeight: "600" },
  switchTextActive: { color: colors.text },
  title: { color: colors.text, fontSize: 25, fontWeight: "800", letterSpacing: -0.7 },
  description: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 8, marginBottom: 22 },
  input: { borderWidth: 1, borderColor: colors.line, backgroundColor: "#FFFFFF", paddingHorizontal: 15, paddingVertical: 15, fontSize: 14, color: colors.text, marginBottom: 12 },
  primary: { backgroundColor: colors.text, minHeight: 52, paddingHorizontal: 17, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 7 },
  primaryText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  disabled: { opacity: 0.6 },
  error: { color: colors.danger, fontSize: 12, marginBottom: 10 },
  note: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 14 },
  bottom: { alignItems: "center", paddingBottom: 30 },
  bottomText: { color: colors.muted, fontSize: 10, textAlign: "center" },
  preview: { color: colors.violet, fontSize: 12, fontWeight: "700", marginTop: 14 }
});
