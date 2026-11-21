import { useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { colors } from "../src/theme";

function SettingRow({ icon, title, detail, onPress, danger = false }: { icon: keyof typeof Ionicons.glyphMap; title: string; detail: string; onPress?: () => void; danger?: boolean }) {
  return <Pressable style={styles.row} onPress={onPress} disabled={!onPress}><View style={styles.rowIcon}><Ionicons name={icon} size={19} color={danger ? colors.danger : colors.violet} /></View><View style={styles.rowText}><Text style={[styles.rowTitle, danger && { color: colors.danger }]}>{title}</Text><Text style={styles.rowDetail}>{detail}</Text></View>{onPress && <Ionicons name="chevron-forward" size={18} color={colors.muted} />}</Pressable>;
}
export default function SettingsScreen() {
  const [busy, setBusy] = useState(false);
  async function logout() {
    if (busy) return;
    setBusy(true);
    try { await SecureStore.deleteItemAsync("reelix_access_token"); router.replace("/auth"); }
    catch { Alert.alert("Не удалось выйти", "Попробуй ещё раз."); }
    finally { setBusy(false); }
  }
  return (
    <View style={styles.screen}>
      <View style={styles.header}><Pressable onPress={() => router.back()}><Ionicons name="arrow-back" size={23} color={colors.text} /></Pressable><Text style={styles.title}>Настройки</Text><View style={{ width: 23 }} /></View>
      <Text style={styles.section}>АККАУНТ</Text>
      <SettingRow icon="person-circle-outline" title="Данные профиля" detail="Имя, описание и фотография профиля" />
      <SettingRow icon="lock-closed-outline" title="Приватность" detail="Закрытый аккаунт и управление доступом" />
      <SettingRow icon="shield-checkmark-outline" title="Безопасность" detail="Пароль и защита аккаунта" />
      <SettingRow icon="checkmark-circle-outline" title="Верификация" detail="Подтверждение подлинности профиля" />
      <Text style={styles.section}>ПРИЛОЖЕНИЕ</Text>
      <SettingRow icon="notifications-outline" title="Уведомления" detail="Настройка push-уведомлений" />
      <SettingRow icon="moon-outline" title="Тема оформления" detail="Светлая тема Reelix" />
      <SettingRow icon="help-circle-outline" title="Помощь и поддержка" detail="Ответы на вопросы и связь с командой" />
      <SettingRow icon="document-text-outline" title="Правила и конфиденциальность" detail="Документы приложения" />
      <View style={styles.bottom}><Text style={styles.version}>REELIX · ранняя версия</Text><Pressable style={styles.logout} onPress={logout} disabled={busy}><Ionicons name="log-out-outline" size={18} color={colors.danger} /><Text style={styles.logoutText}>{busy ? "Выходим..." : "Выйти из аккаунта"}</Text></Pressable><Text style={styles.disclaimer}>Часть разделов пока отображается как планируемая функция и станет доступна после подключения серверной логики.</Text></View>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 18, paddingBottom: 22 },
  title: { color: colors.text, fontSize: 21, fontWeight: "800" },
  section: { color: colors.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1.2, marginTop: 14, marginBottom: 7 },
  row: { flexDirection: "row", alignItems: "center", minHeight: 66, borderBottomWidth: 1, borderBottomColor: colors.line, gap: 12 },
  rowIcon: { width: 36, height: 36, backgroundColor: "#F3F0FF", alignItems: "center", justifyContent: "center" },
  rowText: { flex: 1, gap: 3 },
  rowTitle: { color: colors.text, fontSize: 13, fontWeight: "700" },
  rowDetail: { color: colors.muted, fontSize: 11 },
  bottom: { marginTop: "auto", paddingTop: 20, paddingBottom: 22 },
  version: { color: colors.muted, fontSize: 10, letterSpacing: 1, marginBottom: 14 },
  logout: { flexDirection: "row", alignItems: "center", gap: 9, paddingVertical: 12 },
  logoutText: { color: colors.danger, fontSize: 13, fontWeight: "700" },
  disclaimer: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 8 }
});
