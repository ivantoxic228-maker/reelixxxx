import { View, Text, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/theme";

export default function SearchScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Поиск</Text>
      <View style={styles.search}>
        <Ionicons name="search-outline" size={19} color={colors.muted} />
        <TextInput placeholder="Люди, видео и хэштеги" placeholderTextColor={colors.muted} style={styles.input} editable={false} />
      </View>
      <Text style={styles.hint}>Поиск станет доступен после подключения API.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: 20 },
  title: { color: colors.text, fontSize: 28, fontWeight: "800", marginTop: 12, marginBottom: 22 },
  search: { height: 48, backgroundColor: colors.surface, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 10 },
  input: { flex: 1, color: colors.text, fontSize: 14 },
  hint: { color: colors.muted, fontSize: 13, marginTop: 18 }
});