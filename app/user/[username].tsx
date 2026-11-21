import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/theme";
import { apiRequest } from "../../src/api";

type Profile = { id: string; username: string; displayName: string; avatarUrl?: string | null; bio: string; isPrivate: boolean; isVerified?: boolean; _count: { posts: number; followers: number; following: number } };
export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    apiRequest<Profile>(`/users/${encodeURIComponent(username || "")}`)
      .then(data => { if (active) setProfile(data); })
      .catch(e => { if (active) setError(e instanceof Error ? e.message : "Не удалось загрузить профиль"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [username]);
  async function toggleFollow() {
    if (!profile || busy) return;
    if (profile.isPrivate) { Alert.alert("Закрытый аккаунт", "Заявки на подписку пока не подключены. Мы не будем отправлять фиктивную заявку."); return; }
    setBusy(true);
    try {
      const result = await apiRequest<{ following: boolean }>(`/users/${encodeURIComponent(profile.username)}/follow`, { method: "POST" }, true);
      setFollowing(result.following);
    } catch (e) { Alert.alert("Не удалось подписаться", e instanceof Error ? e.message : "Войди в аккаунт и попробуй ещё раз."); }
    finally { setBusy(false); }
  }
  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.violet} /></View>;
  if (!profile) return <View style={styles.center}><Text style={styles.error}>{error || "Профиль не найден"}</Text><Pressable onPress={() => router.back()}><Text style={styles.link}>Назад</Text></Pressable></View>;
  return (
    <View style={styles.screen}>
      <View style={styles.header}><Pressable onPress={() => router.back()}><Ionicons name="arrow-back" size={23} color={colors.text} /></Pressable><Text style={styles.headerTitle}>Профиль</Text><View style={{ width: 23 }} /></View>
      <View style={styles.profileTop}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{(profile.displayName || profile.username).slice(0,1).toUpperCase()}</Text></View>
        <Text style={styles.name}>{profile.displayName}{profile.isVerified ? "  ✓" : ""}</Text><Text style={styles.handle}>@{profile.username}</Text>
        <View style={styles.stats}><View style={styles.stat}><Text style={styles.statValue}>{profile._count.posts}</Text><Text style={styles.statLabel}>видео</Text></View><View style={styles.stat}><Text style={styles.statValue}>{profile._count.followers}</Text><Text style={styles.statLabel}>подписчики</Text></View><View style={styles.stat}><Text style={styles.statValue}>{profile._count.following}</Text><Text style={styles.statLabel}>подписки</Text></View></View>
        {!!profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
        <Pressable style={[styles.follow, following && styles.following]} onPress={toggleFollow} disabled={busy}><Text style={[styles.followText, following && styles.followingText]}>{busy ? "..." : following ? "Вы подписаны" : profile.isPrivate ? "Закрытый аккаунт" : "Подписаться"}</Text></Pressable>
      </View>
      <View style={styles.privateBox}><Ionicons name={profile.isPrivate ? "lock-closed-outline" : "videocam-outline"} size={25} color={colors.violet} /><Text style={styles.privateTitle}>{profile.isPrivate ? "Это закрытый профиль" : "Видео автора"}</Text><Text style={styles.privateText}>{profile.isPrivate ? "Публикации доступны только одобренным подписчикам." : "Сетка публикаций появится здесь после подключения отдельной выдачи профиля."}</Text></View>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 18, paddingBottom: 20 },
  headerTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
  profileTop: { alignItems: "center", paddingTop: 12 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: "#F0EDFF", alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.violet, fontSize: 30, fontWeight: "800" },
  name: { color: colors.text, fontSize: 21, fontWeight: "800", marginTop: 14 },
  handle: { color: colors.muted, fontSize: 13, marginTop: 3 },
  stats: { flexDirection: "row", gap: 34, marginTop: 22 },
  stat: { alignItems: "center", gap: 3 },
  statValue: { color: colors.text, fontSize: 17, fontWeight: "800" },
  statLabel: { color: colors.muted, fontSize: 11 },
  bio: { color: colors.text, fontSize: 13, lineHeight: 19, textAlign: "center", marginTop: 18 },
  follow: { backgroundColor: colors.text, minWidth: 190, alignItems: "center", paddingVertical: 13, marginTop: 20 },
  following: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  followText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  followingText: { color: colors.text },
  privateBox: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28, gap: 10 },
  privateTitle: { color: colors.text, fontSize: 17, fontWeight: "800" },
  privateText: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  error: { color: colors.danger, fontSize: 13 },
  link: { color: colors.violet, fontWeight: "700" }
});
