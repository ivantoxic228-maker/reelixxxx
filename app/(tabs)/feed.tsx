import { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { VideoView, useVideoPlayer } from "expo-video";
import { colors } from "../../src/theme";
import { apiRequest } from "../../src/api";

type Post = { id: string; caption: string; videoUrl: string; user: { username: string; displayName: string; avatarUrl?: string | null }; _count: { likes: number; comments: number } };
function VideoCard({ post }: { post: Post }) {
  const player = useVideoPlayer(post.videoUrl, p => { p.loop = true; p.play(); });
  return (
    <View style={styles.card}>
      <VideoView player={player} style={styles.video} contentFit="cover" nativeControls={false} allowsFullscreen />
      <View style={styles.overlay}>
        <View style={styles.info}>
          <Text style={styles.username}>@{post.user.username}</Text>
          {!!post.caption && <Text style={styles.caption}>{post.caption}</Text>}
        </View>
        <View style={styles.actions}>
          <View style={styles.action}><Ionicons name="heart-outline" size={27} color="#fff" /><Text style={styles.count}>{post._count.likes}</Text></View>
          <View style={styles.action}><Ionicons name="chatbubble-ellipses-outline" size={25} color="#fff" /><Text style={styles.count}>{post._count.comments}</Text></View>
          <Ionicons name="share-social-outline" size={24} color="#fff" />
        </View>
      </View>
    </View>
  );
}
export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(async (refresh = false) => {
    try {
      setError("");
      const data = await apiRequest<{ items: Post[] }>("/posts/feed");
      setPosts(data.items);
    } catch (e) { setError(e instanceof Error ? e.message : "Не удалось загрузить ленту"); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.violet} /><Text style={styles.muted}>Загружаем Reelix...</Text></View>;
  return (
    <View style={styles.screen}>
      <View style={styles.header}><Text style={styles.wordmark}>reelix<Text style={styles.dot}>.</Text></Text><Ionicons name="paper-plane-outline" size={23} color={colors.text} /></View>
      {!!error && <View style={styles.notice}><Text style={styles.noticeText}>{error}</Text><Pressable onPress={() => load()}><Text style={styles.retry}>Повторить</Text></Pressable></View>}
      <FlatList data={posts} keyExtractor={item => item.id} renderItem={({ item }) => <VideoCard post={item} />} pagingEnabled showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} />} ListEmptyComponent={<View style={styles.center}><Ionicons name="videocam-outline" size={38} color={colors.violet} /><Text style={styles.emptyTitle}>Пока нет видео</Text><Text style={styles.muted}>Опубликуй первый ролик — он появится здесь.</Text></View>} />
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { height: 58, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: colors.line },
  wordmark: { color: colors.text, fontSize: 25, fontWeight: "800", letterSpacing: -1.2 },
  dot: { color: colors.violet },
  card: { height: 620, backgroundColor: "#17171d", marginBottom: 2 },
  video: { width: "100%", height: "100%" },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end", flexDirection: "row", alignItems: "flex-end", padding: 18 },
  info: { flex: 1, paddingBottom: 10 },
  username: { color: "#fff", fontWeight: "800", fontSize: 15, marginBottom: 8 },
  caption: { color: "#fff", fontSize: 13, lineHeight: 18, maxWidth: 250 },
  actions: { alignItems: "center", gap: 20, paddingBottom: 10 },
  action: { alignItems: "center", gap: 4 },
  count: { color: "#fff", fontSize: 11 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 30, gap: 12 },
  muted: { color: colors.muted, fontSize: 13, textAlign: "center" },
  emptyTitle: { color: colors.text, fontSize: 20, fontWeight: "700" },
  notice: { padding: 12, backgroundColor: "#FFF1F3" },
  noticeText: { color: colors.danger, fontSize: 12 },
  retry: { color: colors.violet, fontWeight: "700", marginTop: 6 }
});
