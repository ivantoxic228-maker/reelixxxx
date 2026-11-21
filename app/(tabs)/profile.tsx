import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors } from "../../src/theme";

export default function ProfileScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.top}>
        <Text style={styles.title}>Профиль</Text>
        <Pressable onPress={() => router.push("/settings")} accessibilityRole="button" accessibilityLabel="Настройки">
          <Ionicons name="settings-outline" size={23} color={colors.text} />
        </Pressable>
      </View>
      <View style={styles.center}>
        <View style={styles.avatar}><Ionicons name="person-outline" size={32} color={colors.violet} /></View>
        <Text style={styles.heading}>Твой профиль Reelix</Text>
        <Text style={styles.copy}>Войди или создай аккаунт, чтобы оформить профиль, публиковать видео и подписываться на авторов.</Text>
        <Pressable style={styles.button} onPress={() => router.push("/auth")}><Text style={styles.buttonText}>Войти или зарегистрироваться</Text></Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: 20 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
  title: { color: colors.text, fontSize: 28, fontWeight: "800" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, paddingBottom: 50 },
  avatar: { width: 84, height: 84, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  heading: { color: colors.text, fontSize: 20, fontWeight: "700", marginTop: 20 },
  copy: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: "center", marginTop: 10 },
  button: { backgroundColor: colors.text, paddingHorizontal: 22, paddingVertical: 14, marginTop: 22 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 13 }
});
