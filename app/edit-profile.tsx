import { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, Switch, ActivityIndicator, Alert, ScrollView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../src/theme";
import { apiRequest } from "../src/api";

type Me = { email: string; username: string; displayName: string; bio: string; avatarUrl?: string | null; isPrivate: boolean };
export default function EditProfileScreen() {
  const [me, setMe] = useState<Me | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    apiRequest<Me>("/users/me", {}, true).then(data => { setMe(data); setDisplayName(data.displayName); setBio(data.bio || ""); setIsPrivate(data.isPrivate); })
      .catch(e => Alert.alert("Не удалось загрузить профиль", e instanceof Error ? e.message : "Войди в аккаунт."))
      .finally(() => setLoading(false));
  }, []);
  async function save() {
    if (!displayName.trim()) { Alert.alert("Проверь имя", "Имя профиля не должно быть пустым."); return; }
    setSaving(true);
    try {
      const updated = await apiRequest<Me>("/users/me", { method: "PATCH", body: JSON.stringify({ displayName: displayName.trim(), bio: bio.trim(), isPrivate }) }, true);
      setMe(updated); Alert.alert("Сохранено", "Изменения профиля сохранены.");
    } catch (e) { Alert.alert("Не удалось сохранить", e instanceof Error ? e.message : "Попробуй ещё раз."); }
    finally { setSaving(false); }
  }
  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.violet} /></View>;
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}><Pressable onPress={() => router.back()}><Ionicons name="arrow-back" size={23} color={colors.text} /></Pressable><Text style={styles.title}>Редактировать профиль</Text><View style={{ width: 23 }} /></View>
      <Text style={styles.label}>ИМЯ ПОЛЬЗОВАТЕЛЯ</Text><View style={styles.readonly}><Text style={styles.readonlyText}>@{me?.username}</Text></View>
      <Text style={styles.label}>ОТОБРАЖАЕМОЕ ИМЯ</Text><TextInput value={displayName} onChangeText={setDisplayName} maxLength={40} style={styles.input} placeholder="Как тебя называть" placeholderTextColor={colors.muted} />
      <Text style={styles.label}>О СЕБЕ</Text><TextInput value={bio} onChangeText={setBio} maxLength={160} multiline style={[styles.input, styles.bio]} placeholder="Расскажи немного о себе" placeholderTextColor={colors.muted} />
      <View style={styles.privacy}><View style={styles.privacyText}><Text style={styles.privacyTitle}>Закрытый аккаунт</Text><Text style={styles.privacyHint}>Публикации будут скрыты из общей ленты.</Text></View><Switch value={isPrivate} onValueChange={setIsPrivate} trackColor={{ false: colors.line, true: colors.violet }} /></View>
      <Pressable style={styles.save} onPress={save} disabled={saving}>{saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Сохранить изменения</Text>}</Pressable>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingBottom: 36 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 18, paddingBottom: 26 },
  title: { color: colors.text, fontSize: 18, fontWeight: "800" },
  label: { color: colors.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1, marginTop: 18, marginBottom: 8 },
  readonly: { backgroundColor: colors.surface, padding: 15 },
  readonlyText: { color: colors.muted, fontSize: 14 },
  input: { borderWidth: 1, borderColor: colors.line, padding: 14, color: colors.text, fontSize: 14 },
  bio: { minHeight: 100, textAlignVertical: "top" },
  privacy: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: colors.line, marginTop: 12 },
  privacyText: { flex: 1, paddingRight: 16, gap: 4 },
  privacyTitle: { color: colors.text, fontSize: 13, fontWeight: "700" },
  privacyHint: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  save: { backgroundColor: colors.text, minHeight: 52, alignItems: "center", justifyContent: "center", marginTop: 26 },
  saveText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" }
});
