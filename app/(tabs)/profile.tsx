import { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, RefreshControl, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { colors } from "../../src/theme";
import { apiRequest } from "../../src/api";

type Me = { username: string; displayName: string; bio: string; avatarUrl?: string | null; isPrivate: boolean; _count: { posts: number; followers: number; following: number } };
export default function ProfileScreen() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const load = useCallback(async () => {
    try { setError(""); setMe(await apiRequest<Me>("/users/me", {}, true)); }
    catch (e) { setMe(null); setError(e instanceof Error ? e.message : "Войди в аккаунт."); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.violet} /></View>;
  if (!me) return <View style={styles.screen}><View style={styles.top}><Text style={styles.title}>Профиль</Text><Pressable onPress={() => router.push("/settings")}><Ionicons name="settings-outline" size={23} color={colors.text} /></Pressable></View><View style={styles.center}><View style={styles.avatar}><Ionicons name="person-outline" size={32} color={colors.violet} /></View><Text style={styles.heading}>Твой профиль Reelix</Text><Text style={styles.copy}>{error || "Войди или создай аккаунт, чтобы оформить профиль, публиковать видео и подписываться на авторов."}</Text><Pressable style={styles.button} onPress={() => router.push("/auth")}><Text style={styles.buttonText}>Войти или зарегистрироваться</Text></Pressable></View></View>;
  return (
    <ScrollView style={styles.screen} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}>
      <View style={styles.top}><Text style={styles.title}>Профиль</Text><Pressable onPress={() => router.push("/settings")}><Ionicons name="settings-outline" size={23} color={colors.text} /></Pressable></View>
      <View style={styles.profile}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{(me.displayName || me.username).slice(0,1).toUpperCase()}</Text></View>
        <Text style={styles.heading}>{me.displayName}</Text><Text style={styles.handle}>@{me.username}</Text>
        {!!me.bio && <Text style={styles.copy}>{me.bio}</Text>}
        <View style={styles.stats}><View style={styles.stat}><Text style={styles.statValue}>{me._count.posts}</Text><Text style={styles.statLabel}>видео</Text></View><View style={styles.stat}><Text style={styles.statValue}>{me._count.followers}</Text><Text style={styles.statLabel}>подписчики</Text></View><View style={styles.stat}><Text style={styles.statValue}>{me._count.following}</Text><Text style={styles.statLabel}>подписки</Text></View></View>
        <Pressable style={styles.edit} onPress={() => router.push("/edit-profile")}><Text style={styles.editText}>Редактировать профиль</Text></Pressable>
        {me.isPrivate && <Text style={styles.private}> <Ionicons name="lock-closed" size={12} color={colors.violet} /> Закрытый аккаунт</Text>}
      </View>
      <View style={styles.empty}><Ionicons name="grid-outline" size={30} color={colors.violet} /><Text style={styles.copy}>Твои публикации будут отображаться здесь.</Text></View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 },
  title: { color: colors.text, fontSize: 28, fontWeight: "800" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, paddingBottom: 50, gap: 12 },
  avatar: { width: 92, height: 92, borderRadius: 46, backgroundColor: "#F0EDFF", alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.violet, fontSize: 30, fontWeight: "800" },
  heading: { color: colors.text, fontSize: 20, fontWeight: "700", marginTop: 14 },
  handle: { color: colors.muted, fontSize: 13, marginTop: 4 },
  copy: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: "center", marginTop: 8 },
  button: { backgroundColor: colors.text, paddingHorizontal: 22, paddingVertical: 14, marginTop: 14 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  profile: { alignItems: "center", paddingTop: 28 },
  stats: { flexDirection: "row", gap: 40, marginTop: 22 },
  stat: { alignItems: "center", gap: 4 },
  statValue: { color: colors.text, fontSize: 17, fontWeight: "800" },
  statLabel: { color: colors.muted, fontSize: 11 },
  edit: { borderWidth: 1, borderColor: colors.line, paddingVertical: 12, paddingHorizontal: 28, marginTop: 22, width: "100%", alignItems: "center" },
  editText: { color: colors.text, fontSize: 13, fontWeight: "700" },
  private: { color: colors.violet, fontSize: 11, marginTop: 12 },
  empty: { alignItems: "center", paddingVertical: 50, gap: 8, borderTopWidth: 1, borderTopColor: colors.line, marginTop: 26 }
});
