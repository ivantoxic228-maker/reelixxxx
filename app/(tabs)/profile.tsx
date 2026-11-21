import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/theme";

export default function ProfileScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.top}>
        <Text style={styles.title}>Профиль</Text>
        <Ionicons name="settings-outline" size={23} color={colors.text} />
      </View>
      <View style={styles.center}>
        <View style={styles.avatar}><Ionicons name="person-outline" size={32} color={colors.violet} /></View>
        <Text style={styles.heading}>Твой профиль Reelix</Text>
        <Text style={styles.copy}>Войди или создай аккаунт, чтобы оформить профиль, публиковать видео и подписываться на авторов.</Text>
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
  copy: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: "center", marginTop: 10 }
});