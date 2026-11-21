import { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/theme";
import { pickVideo, uploadVideo } from "../../src/media";
import { apiRequest } from "../../src/api";
import type { ImagePickerAsset } from "expo-image-picker";

export default function CreateScreen() {
  const [asset, setAsset] = useState<ImagePickerAsset | null>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  async function choose() {
    try { const selected = await pickVideo(); if (selected) setAsset(selected); }
    catch (e) { Alert.alert("Не получилось выбрать видео", e instanceof Error ? e.message : "Попробуй ещё раз"); }
  }
  async function publish() {
    if (!asset) return;
    setBusy(true);
    try {
      const uploaded = await uploadVideo(asset);
      await apiRequest("/posts", { method: "POST", body: JSON.stringify({ videoUrl: uploaded.secure_url, publicId: uploaded.public_id, duration: uploaded.duration, caption }) }, true);
      setAsset(null); setCaption("");
      Alert.alert("Готово", "Видео опубликовано в Reelix.");
    } catch (e) { Alert.alert("Не удалось опубликовать", e instanceof Error ? e.message : "Попробуй позже"); }
    finally { setBusy(false); }
  }
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Создать</Text>
      <Pressable style={styles.picker} onPress={choose} disabled={busy}>
        <Ionicons name={asset ? "checkmark-circle-outline" : "cloud-upload-outline"} size={38} color={colors.violet} />
        <Text style={styles.heading}>{asset ? "Видео выбрано" : "Выбрать видео"}</Text>
        <Text style={styles.copy}>{asset ? asset.fileName || "Видео готово к публикации" : "Выбери ролик из галереи. Максимальная длительность — 3 минуты."}</Text>
      </Pressable>
      {asset && <>
        <TextInput value={caption} onChangeText={setCaption} placeholder="Добавь описание..." placeholderTextColor={colors.muted} multiline maxLength={2200} style={styles.caption} />
        <Pressable style={styles.publish} onPress={publish} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.publishText}>Загрузить и опубликовать</Text>}
        </Pressable>
      </>}
      <Text style={styles.hint}>Перед публикацией видео загружается в Cloudinary, а запись о нём сохраняется на сервере Reelix.</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: 20 },
  title: { color: colors.text, fontSize: 28, fontWeight: "800", marginTop: 12 },
  picker: { minHeight: 220, borderWidth: 1, borderColor: colors.line, borderStyle: "dashed", alignItems: "center", justifyContent: "center", padding: 24, marginTop: 28 },
  heading: { color: colors.text, fontSize: 20, fontWeight: "700", marginTop: 16 },
  copy: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: "center", marginTop: 8 },
  caption: { borderWidth: 1, borderColor: colors.line, minHeight: 90, padding: 14, color: colors.text, marginTop: 18, textAlignVertical: "top" },
  publish: { backgroundColor: colors.text, minHeight: 52, alignItems: "center", justifyContent: "center", marginTop: 12 },
  publishText: { color: "#fff", fontWeight: "700" },
  hint: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 18 }
});
