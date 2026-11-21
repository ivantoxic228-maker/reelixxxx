import { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/theme";
import { apiRequest } from "../../src/api";

type Message = { id: string; text: string; senderId: string; createdAt: string; sender: { username: string; displayName: string } };
type Me = { id: string };
export default function ChatScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const load = useCallback(async () => {
    try {
      const [items, current] = await Promise.all([apiRequest<Message[]>(`/messages/${encodeURIComponent(username || "")}`, {}, true), apiRequest<Me>("/users/me", {}, true)]);
      setMessages(items); setMe(current);
    } catch { /* The screen remains usable with an explicit empty state. */ }
    finally { setLoading(false); }
  }, [username]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  async function send() {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    try { await apiRequest<Message>(`/messages/${encodeURIComponent(username || "")}`, { method: "POST", body: JSON.stringify({ text: value }) }, true); setText(""); await load(); }
    finally { setSending(false); }
  }
  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}>
      <View style={styles.header}><Pressable onPress={() => router.back()}><Ionicons name="arrow-back" size={23} color={colors.text} /></Pressable><View style={styles.headerInfo}><Text style={styles.name}>@{username}</Text><Text style={styles.sub}>Личные сообщения Reelix</Text></View><Pressable onPress={load}><Ionicons name="refresh-outline" size={21} color={colors.text} /></Pressable></View>
      {loading ? <View style={styles.center}><ActivityIndicator color={colors.violet} /></View> : <FlatList style={styles.list} data={messages} keyExtractor={item => item.id} contentContainerStyle={styles.messages} renderItem={({ item }) => <View style={[styles.bubble, item.senderId === me?.id ? styles.mine : styles.theirs]}><Text style={[styles.messageText, item.senderId === me?.id && styles.mineText]}>{item.text}</Text><Text style={[styles.time, item.senderId === me?.id && styles.mineTime]}>{new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text></View>} ListEmptyComponent={<View style={styles.center}><Text style={styles.empty}>Начни переписку первым сообщением.</Text></View>} />}
      <View style={styles.composer}><TextInput value={text} onChangeText={setText} placeholder="Сообщение..." placeholderTextColor={colors.muted} style={styles.input} multiline maxLength={4000} /><Pressable style={[styles.send, (!text.trim() || sending) && styles.disabled]} onPress={send} disabled={!text.trim() || sending}><Ionicons name="arrow-up" size={21} color="#fff" /></Pressable></View>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
  headerInfo: { flex: 1, gap: 2 },
  name: { color: colors.text, fontSize: 15, fontWeight: "800" },
  sub: { color: colors.muted, fontSize: 11 },
  list: { flex: 1 },
  messages: { padding: 16, gap: 10 },
  bubble: { maxWidth: "82%", padding: 12, borderRadius: 14, gap: 5 },
  mine: { alignSelf: "flex-end", backgroundColor: colors.violet },
  theirs: { alignSelf: "flex-start", backgroundColor: colors.surface },
  messageText: { color: colors.text, fontSize: 14, lineHeight: 19 },
  mineText: { color: "#fff" },
  time: { color: colors.muted, fontSize: 9, alignSelf: "flex-end" },
  mineTime: { color: "#EAE4FF" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  empty: { color: colors.muted, fontSize: 13 },
  composer: { flexDirection: "row", alignItems: "flex-end", gap: 10, padding: 12, borderTopWidth: 1, borderTopColor: colors.line },
  input: { flex: 1, maxHeight: 110, minHeight: 44, borderRadius: 22, backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 11, color: colors.text, fontSize: 14 },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.violet, alignItems: "center", justifyContent: "center" },
  disabled: { opacity: 0.4 }
});
