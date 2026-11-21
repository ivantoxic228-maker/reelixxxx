import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/theme";

export default function FeedScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.wordmark}>reelix<Text style={styles.dot}>.</Text></Text>
        <Ionicons name="paper-plane-outline" size={23} color={colors.text} />
      </View>
      <View style={styles.center}>
        <View style={styles.mark}><Ionicons name="play" size={27} color={colors.violet} /></View>
        <Text style={styles.title}>Твоя лента начинается здесь</Text>
        <Text style={styles.description}>Здесь будут короткие видео от авторов, на которых ты подписан, и рекомендации Reelix.</Text>
        <Text style={styles.note}>Лента появится после подключения аккаунтов и сервера.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { height: 58, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: colors.line },
  wordmark: { color: colors.text, fontSize: 25, fontWeight: "800", letterSpacing: -1.2 },
  dot: { color: colors.violet },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 34, paddingBottom: 48 },
  mark: { width: 66, height: 66, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  title: { color: colors.text, fontSize: 21, fontWeight: "700", textAlign: "center", letterSpacing: -0.4 },
  description: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: "center", marginTop: 12 },
  note: { color: colors.violet, fontSize: 12, textAlign: "center", marginTop: 18 }
});