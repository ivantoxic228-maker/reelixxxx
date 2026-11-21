import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/theme";

export default function CreateScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Создать</Text>
      <View style={styles.center}>
        <Ionicons name="cloud-upload-outline" size={42} color={colors.violet} />
        <Text style={styles.heading}>Поделись моментом</Text>
        <Text style={styles.copy}>Загрузка видео и доступ к камере появятся после подключения медиахранилища и разрешений устройства.</Text>
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