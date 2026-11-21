import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { colors } from "../src/theme";

export default function Index() {
  useEffect(() => {
    let active = true;
    SecureStore.getItemAsync("reelix_access_token").then(token => {
      if (active) router.replace(token ? "/(tabs)/feed" : "/auth");
    }).catch(() => { if (active) router.replace("/auth"); });
    return () => { active = false; };
  }, []);
  return <View style={styles.screen}><ActivityIndicator color={colors.violet} /></View>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" } });
