import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/theme";

export default function InboxScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Сообщения</Text>
      <View style={styles.center}>
        <Ionicons name="chatbubbles-outline" size={42} color={colors.violet} />
        <Text style={styles.heading}>Пока тихо</Text>
        <Text style={styles.copy}>Личные сообщения появятся, когда будут готовы аккаунты и сервер обмена сообщениями.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: 20 },
  title: { color: colors.text, fontSize: 28, fontWeight: "800", marginTop: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, paddingBottom: 50 },
  heading: { color: colors.text, fontSize: 20, fontWeight: "700", marginTop: 20 },
  copy: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: "center", marginTop: 10 }
});