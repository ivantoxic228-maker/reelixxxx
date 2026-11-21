import { useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/theme";
import { apiRequest } from "../../src/api";

type Conversation = { user: { id: string; username: string; displayName: string; avatarUrl?: string | null }; lastMessage: { text: string; createdAt: string; senderId: string }; unreadCount: number };
export default function InboxScreen() {
  const [items, setItems] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try { setError(""); setItems(await apiRequest<Conversation[]>("/messages", {}, true)); }
    catch (e) { setError(e instanceof Error ? e.message : "Войди в аккаунт, чтобы открыть сообщения."); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Сообщения</Text>
      {loading ? <View style={styles.center}><ActivityIndicator color={colors.violet} /></View> : error ? <View style={styles.center}><Ionicons name="lock-closed-outline" size={34} color={colors.violet} /><Text style={styles.copy}>{error}</Text><Pressable style={styles.button} onPress={() => router.push("/auth")}><Text style={styles.buttonText}>Войти</Text></Pressable></View> : <FlatList data={items} keyExtractor={item => item.user.id} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />} renderItem={({ item }) => <Pressable style={styles.row} onPress={() => router.push(`/messages/${item.user.username}`)}><View style={styles.avatar}><Text style={styles.avatarText}>{item.user.displayName.slice(0,1).toUpperCase()}</Text></View><View style={styles.info}><Text style={styles.name}>{item.user.displayName}</Text><Text style={styles.handle}>@{item.user.username}</Text><Text style={styles.preview} numberOfLines={1}>{item.lastMessage.text}</Text></View>{item.unreadCount > 0 && <View style={styles.unread}><Text style={styles.unreadText}>{item.unreadCount}</Text></View>}</Pressable>} ListEmptyComponent={<View style={styles.center}><Ionicons name="chatbubbles-outline" size={42} color={colors.violet} /><Text style={styles.heading}>Пока тихо</Text><Text style={styles.copy}>Когда появится переписка, она будет здесь. Открой профиль автора и начни диалог.</Text></View>} />}
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: 20 },
  title: { color: colors.text, fontSize: 28, fontWeight: "800", marginTop: 12, marginBottom: 18 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 12 },
  heading: { color: colors.text, fontSize: 20, fontWeight: "700" },
  copy: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#F0EDFF", alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.violet, fontSize: 18, fontWeight: "800" },
  info: { flex: 1, gap: 2 },
  name: { color: colors.text, fontSize: 14, fontWeight: "700" },
  handle: { color: colors.muted, fontSize: 11 },
  preview: { color: colors.muted, fontSize: 12, marginTop: 3 },
  unread: { minWidth: 22, height: 22, borderRadius: 11, backgroundColor: colors.violet, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 },
  unreadText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  button: { backgroundColor: colors.text, paddingHorizontal: 24, paddingVertical: 12, marginTop: 6 },
  buttonText: { color: "#fff", fontWeight: "700" }
});
