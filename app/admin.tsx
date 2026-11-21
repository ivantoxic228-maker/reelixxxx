import { useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Alert, TextInput, ScrollView } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../src/theme";
import { apiRequest } from "../src/api";

type Post = { id: string; caption: string; isFeatured: boolean; isHidden: boolean; views: number; user: { username: string; displayName: string; isVerified: boolean }; _count: { likes: number; comments: number } };
type User = { id: string; username: string; displayName: string; isVerified: boolean; role: string };
type Overview = { users: number; posts: number; hidden: number; featured: number; sounds: number };
type Sound = { id: string; title: string; artist: string; audioUrl: string; publicId?: string | null; isActive: boolean };
export default function AdminScreen() {
  const [tab, setTab] = useState<"posts" | "users" | "sounds">("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [publicId, setPublicId] = useState("");
  const load = useCallback(async () => {
    try {
      const [o,p,u,s] = await Promise.all([
        apiRequest<Overview>("/admin/overview", {}, true),
        apiRequest<Post[]>("/admin/posts", {}, true),
        apiRequest<User[]>("/admin/users", {}, true),
        apiRequest<Sound[]>("/admin/sounds", {}, true)
      ]);
      setOverview(o); setPosts(p); setUsers(u); setSounds(s);
    } catch (e) { Alert.alert("Панель недоступна", e instanceof Error ? e.message : "Вход администратора не подтверждён."); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  async function moderate(post: Post, patch: { isFeatured?: boolean; isHidden?: boolean }) {
    setBusyId(post.id);
    try { const updated = await apiRequest<Post>(`/admin/posts/${post.id}`, { method: "PATCH", body: JSON.stringify(patch) }, true); setPosts(old => old.map(x => x.id === post.id ? { ...x, ...updated } : x)); await load(); }
    catch (e) { Alert.alert("Ошибка", e instanceof Error ? e.message : "Не удалось изменить видео."); }
    finally { setBusyId(""); }
  }
  async function remove(post: Post) {
    Alert.alert("Удалить видео?", "Публикация и её комментарии будут удалены без возможности восстановления.", [{ text: "Отмена", style: "cancel" }, { text: "Удалить", style: "destructive", onPress: async () => { setBusyId(post.id); try { await apiRequest(`/admin/posts/${post.id}`, { method: "DELETE" }, true); setPosts(old => old.filter(x => x.id !== post.id)); await load(); } catch (e) { Alert.alert("Ошибка", e instanceof Error ? e.message : "Не удалось удалить."); } finally { setBusyId(""); } } }]);
  }
  async function verify(user: User) {
    setBusyId(user.id);
    try { await apiRequest(`/admin/users/${user.id}/verification`, { method: "PATCH", body: JSON.stringify({ isVerified: !user.isVerified }) }, true); setUsers(old => old.map(x => x.id === user.id ? { ...x, isVerified: !x.isVerified } : x)); }
    catch (e) { Alert.alert("Ошибка", e instanceof Error ? e.message : "Не удалось изменить статус."); }
    finally { setBusyId(""); }
  }
  async function addSound() {
    if (!title.trim() || !artist.trim() || !audioUrl.trim() || !publicId.trim()) { Alert.alert("Заполни поля", "Нужны название, автор, ссылка на аудио и Cloudinary Public ID."); return; }
    try { await apiRequest("/admin/sounds", { method: "POST", body: JSON.stringify({ title: title.trim(), artist: artist.trim(), audioUrl: audioUrl.trim(), publicId: publicId.trim(), source: "licensed" }) }, true); setTitle(""); setArtist(""); setAudioUrl(""); setPublicId(""); await load(); Alert.alert("Готово", "Звук добавлен в библиотеку."); }
    catch (e) { Alert.alert("Ошибка", e instanceof Error ? e.message : "Не удалось добавить звук."); }
  }
  async function toggleSound(sound: Sound) {
    try { await apiRequest(`/admin/sounds/${sound.id}`, { method: "PATCH", body: JSON.stringify({ isActive: !sound.isActive }) }, true); await load(); }
    catch (e) { Alert.alert("Ошибка", e instanceof Error ? e.message : "Не удалось изменить звук."); }
  }
  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.violet} /></View>;
  return (
    <View style={styles.screen}>
      <View style={styles.header}><Pressable onPress={() => router.back()}><Ionicons name="arrow-back" size={23} color={colors.text} /></Pressable><Text style={styles.title}>Админ-панель</Text><Pressable onPress={load}><Ionicons name="refresh" size={22} color={colors.text} /></Pressable></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stats}>{[["Пользователи",overview?.users],["Видео",overview?.posts],["В топе",overview?.featured],["Скрыто",overview?.hidden],["Звуки",overview?.sounds]].map(([label,value]) => <View key={String(label)} style={styles.stat}><Text style={styles.statValue}>{value ?? "—"}</Text><Text style={styles.statLabel}>{label}</Text></View>)}</ScrollView>
      <View style={styles.tabs}>{(["posts","users","sounds"] as const).map(key => <Pressable key={key} onPress={() => setTab(key)} style={[styles.tab, tab === key && styles.tabActive]}><Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{key === "posts" ? "Видео" : key === "users" ? "Профили" : "Звуки"}</Text></Pressable>)}</View>
      {tab === "posts" && <FlatList data={posts} keyExtractor={x => x.id} contentContainerStyle={styles.list} renderItem={({item}) => <View style={styles.card}><Text style={styles.cardTitle}>@{item.user.username} {item.user.isVerified ? "✓" : ""}</Text><Text style={styles.caption} numberOfLines={3}>{item.caption || "Без описания"}</Text><Text style={styles.meta}>{item.views} просмотров · {item._count.likes} лайков · {item._count.comments} комментариев</Text><View style={styles.actions}><Pressable style={styles.smallButton} onPress={() => moderate(item,{isFeatured:!item.isFeatured})} disabled={busyId===item.id}><Text style={styles.smallText}>{item.isFeatured ? "Убрать из топа" : "Поднять в топ"}</Text></Pressable><Pressable style={styles.smallButton} onPress={() => moderate(item,{isHidden:!item.isHidden})} disabled={busyId===item.id}><Text style={styles.smallText}>{item.isHidden ? "Показать" : "Скрыть"}</Text></Pressable><Pressable style={styles.deleteButton} onPress={() => remove(item)} disabled={busyId===item.id}><Ionicons name="trash-outline" color={colors.danger} size={17}/></Pressable></View></View>} ListEmptyComponent={<Text style={styles.empty}>Публикаций пока нет.</Text>} />}
      {tab === "users" && <FlatList data={users} keyExtractor={x => x.id} contentContainerStyle={styles.list} renderItem={({item}) => <View style={styles.userRow}><View style={{flex:1}}><Text style={styles.cardTitle}>{item.displayName} @{item.username}</Text><Text style={styles.meta}>{item.role}</Text></View><Pressable style={styles.smallButton} onPress={() => verify(item)} disabled={busyId===item.id}><Text style={styles.smallText}>{item.isVerified ? "Снять галочку" : "Выдать галочку"}</Text></Pressable></View>} />}
      {tab === "sounds" && <FlatList data={sounds} keyExtractor={x => x.id} contentContainerStyle={styles.list} ListHeaderComponent={<View style={styles.card}><Text style={styles.cardTitle}>Добавить трек</Text><TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Название" placeholderTextColor={colors.muted}/><TextInput style={styles.input} value={artist} onChangeText={setArtist} placeholder="Исполнитель" placeholderTextColor={colors.muted}/><TextInput style={styles.input} value={audioUrl} onChangeText={setAudioUrl} placeholder="Ссылка на аудиофайл Cloudinary" placeholderTextColor={colors.muted} autoCapitalize="none"/><TextInput style={styles.input} value={publicId} onChangeText={setPublicId} placeholder="Cloudinary Public ID аудио" placeholderTextColor={colors.muted} autoCapitalize="none"/><Pressable style={styles.addButton} onPress={addSound}><Text style={styles.addText}>Добавить звук</Text></Pressable><Text style={styles.meta}>Добавляй только аудио, на которое у Reelix есть права использования.</Text></View>} renderItem={({item}) => <View style={styles.userRow}><View style={{flex:1}}><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.meta}>{item.artist} · {item.isActive ? "В библиотеке" : "Скрыт"}</Text></View><Pressable style={styles.smallButton} onPress={() => toggleSound(item)}><Text style={styles.smallText}>{item.isActive ? "Скрыть" : "Включить"}</Text></Pressable></View>} />}
    </View>
  );
}
const styles=StyleSheet.create({
 screen:{flex:1,backgroundColor:colors.background,paddingHorizontal:16},header:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",paddingVertical:16},title:{fontSize:20,fontWeight:"800",color:colors.text},
 stats:{maxHeight:74,marginBottom:12},stat:{backgroundColor:colors.surface,padding:12,marginRight:8,minWidth:82,alignItems:"center"},statValue:{fontSize:18,fontWeight:"800",color:colors.text},statLabel:{fontSize:10,color:colors.muted,marginTop:3},
 tabs:{flexDirection:"row",borderBottomWidth:1,borderColor:colors.line},tab:{flex:1,alignItems:"center",paddingVertical:12},tabActive:{borderBottomWidth:2,borderColor:colors.violet},tabText:{fontSize:12,color:colors.muted,fontWeight:"700"},tabTextActive:{color:colors.violet},
 list:{paddingVertical:12,paddingBottom:40,gap:10},card:{padding:14,backgroundColor:colors.surface,gap:8},cardTitle:{fontSize:13,fontWeight:"800",color:colors.text},caption:{fontSize:12,color:colors.text},meta:{fontSize:10,color:colors.muted},actions:{flexDirection:"row",gap:7,alignItems:"center",flexWrap:"wrap"},smallButton:{borderWidth:1,borderColor:colors.line,paddingHorizontal:10,paddingVertical:8},smallText:{fontSize:10,color:colors.text,fontWeight:"700"},deleteButton:{padding:9},userRow:{flexDirection:"row",alignItems:"center",gap:10,padding:12,backgroundColor:colors.surface},input:{borderWidth:1,borderColor:colors.line,padding:11,color:colors.text,fontSize:12},addButton:{backgroundColor:colors.text,padding:12,alignItems:"center"},addText:{color:"#fff",fontWeight:"800",fontSize:12},empty:{textAlign:"center",color:colors.muted,padding:30},center:{flex:1,alignItems:"center",justifyContent:"center"}
});
