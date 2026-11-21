import { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, FlatList, Pressable, ActivityIndicator, Keyboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors } from "../../src/theme";
import { apiRequest } from "../../src/api";

type UserResult = { id: string; username: string; displayName: string; avatarUrl?: string | null; bio?: string };
export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const value = query.trim();
    if (value.length < 2) { setResults([]); setSearched(false); setError(""); return; }
    const timer = setTimeout(async () => {
      setBusy(true); setError("");
      try {
        const data = await apiRequest<UserResult[]>(`/users/search?q=${encodeURIComponent(value)}`);
        setResults(data); setSearched(true);
      } catch (e) { setError(e instanceof Error ? e.message : "Поиск временно недоступен"); }
      finally { setBusy(false); }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Поиск</Text>
      <View style={styles.search}>
        <Ionicons name="search-outline" size={19} color={colors.muted} />
        <TextInput value={query} onChangeText={setQuery} placeholder="Люди и авторы" placeholderTextColor={colors.muted} style={styles.input} autoCapitalize="none" returnKeyType="search" onSubmitEditing={() => Keyboard.dismiss()} />
        {!!query && <Pressable onPress={() => setQuery("")}><Ionicons name="close-circle" size={19} color={colors.muted} /></Pressable>}
        {busy && <ActivityIndicator color={colors.violet} />}
      </View>
      {error ? <Text style={styles.hint}>{error}</Text> : query.trim().length < 2 ? <Text style={styles.hint}>Введи минимум 2 символа, чтобы найти авторов.</Text> : null}
      <FlatList data={results} keyExtractor={item => item.id} keyboardShouldPersistTaps="handled" renderItem={({ item }) => (
        <Pressable style={styles.result} onPress={() => router.push(`/user/${item.username}`)}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{(item.displayName || item.username).slice(0,1).toUpperCase()}</Text></View>
          <View style={styles.userInfo}><Text style={styles.displayName}>{item.displayName}</Text><Text style={styles.username}>@{item.username}</Text>{!!item.bio && <Text numberOfLines={1} style={styles.bio}>{item.bio}</Text>}</View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </Pressable>
      )} ListEmptyComponent={searched && !busy ? <Text style={styles.hint}>Ничего не найдено. Попробуй другое имя.</Text> : null} />
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: 20 },
  title: { color: colors.text, fontSize: 28, fontWeight: "800", marginTop: 12, marginBottom: 22 },
  search: { minHeight: 48, backgroundColor: colors.surface, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 10 },
  input: { flex: 1, color: colors.text, fontSize: 14, paddingVertical: 12 },
  hint: { color: colors.muted, fontSize: 13, marginTop: 18 },
  result: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.line, gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: "#F0EDFF", alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.violet, fontSize: 18, fontWeight: "800" },
  userInfo: { flex: 1, gap: 2 },
  displayName: { color: colors.text, fontWeight: "700", fontSize: 14 },
  username: { color: colors.muted, fontSize: 12 },
  bio: { color: colors.muted, fontSize: 11, marginTop: 2 }
});
