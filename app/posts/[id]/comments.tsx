import { useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../src/theme";
import { apiRequest } from "../../../src/api";

type Comment = { id: string; text: string; createdAt: string; user: { username: string; displayName: string; avatarUrl?: string | null } };
export default function CommentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [items, setItems] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const load = useCallback(async () => {
    try { setItems(await apiRequest<Comment[]>(`/posts/${encodeURIComponent(id || "")}/comments`)); }
    catch (e) { Alert.alert("Комментарии недоступны", e instanceof Error ? e.message : "Попробуй позже."); }
    finally { setLoading(false); }
  }, [id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  async function send() {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    try {
      const created = await apiRequest<Comment>(`/posts/${encodeURIComponent(id || "")}/comments`, { method: "POST", body: JSON.stringify({ text: value }) }, true);
      setItems(current => [...current, created]); setText("");
    } catch (e) { Alert.alert("Не удалось отправить", e instanceof Error ? e.message : "Войди в аккаунт и попробуй ещё раз."); }
    finally { setSending(false); }
  }
  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.header}><Pressable onPress={() => router.back()}><Ionicons name="arrow-back" size={23} color={colors.text} /></Pressable><Text style={styles.title}>Комментарии</Text><Pressable onPress={load}><Ionicons name="refresh-outline" size={21} color={colors.text} /></Pressable></View>
      {loading ? <View style={styles.center}><ActivityIndicator color={colors.violet} /></View> : <FlatList data={items} keyExtractor={item => item.id} contentContainerStyle={styles.list} renderItem={({ item }) => <View style={styles.comment}><View style={styles.avatar}><Text style={styles.avatarText}>{item.user.displayName.slice(0,1).toUpperCase()}</Text></View><View style={styles.body}><Text style={styles.username}>@{item.user.username}</Text><Text style={styles.commentText}>{item.text}</Text><Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text></View></View>} ListEmptyComponent={<View style={styles.center}><Text style={styles.empty}>Комментариев пока нет. Будь первым!</Text></View>} />}
      <View style={styles.composer}><TextInput value={text} onChangeText={setText} placeholder="Напиши комментарий..." placeholderTextColor={colors.muted} style={styles.input} multiline maxLength={1000} /><Pressable style={[styles.send, (!text.trim() || sending) && styles.disabled]} onPress={send} disabled={!text.trim() || sending}>{sending ? <ActivityIndicator color="#fff" /> : <Ionicons name="arrow-up" size={21} color="#fff" />}</Pressable></View>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 18, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.line },
  title: { color: colors.text, fontSize: 18, fontWeight: "800" },
  list: { padding: 16, gap: 18 },
  comment: { flexDirection: "row", gap: 11 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F0EDFF", alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.violet, fontWeight: "800" },
  body: { flex: 1, gap: 4 },
  username: { color: colors.text, fontSize: 12, fontWeight: "800" },
  commentText: { color: colors.text, fontSize: 13, lineHeight: 18 },
  time: { color: colors.muted, fontSize: 9, marginTop: 2 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  empty: { color: colors.muted, fontSize: 13, textAlign: "center" },
  composer: { flexDirection: "row", alignItems: "flex-end", gap: 10, padding: 12, borderTopWidth: 1, borderTopColor: colors.line },
  input: { flex: 1, minHeight: 44, maxHeight: 110, backgroundColor: colors.surface, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 11, color: colors.text },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.violet, alignItems: "center", justifyContent: "center" },
  disabled: { opacity: 0.4 }
});
