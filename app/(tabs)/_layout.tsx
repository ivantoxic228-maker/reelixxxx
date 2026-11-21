import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/theme";

const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  feed: "play-circle-outline",
  search: "search-outline",
  create: "add-circle-outline",
  inbox: "chatbubble-ellipses-outline",
  profile: "person-circle-outline"
};

export default function TabLayout() {
  return (
    <Tabs screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.violet,
      tabBarInactiveTintColor: colors.muted,
      tabBarStyle: { height: 62, paddingTop: 7, paddingBottom: 7, backgroundColor: colors.background, borderTopColor: colors.line, elevation: 0 },
      tabBarLabelStyle: { fontSize: 10, fontWeight: "600" },
      tabBarIcon: ({ color, size }) => <Ionicons name={iconMap[route.name] ?? "ellipse-outline"} size={size + 1} color={color} />
    })}>
      <Tabs.Screen name="feed" options={{ title: "Лента" }} />
      <Tabs.Screen name="search" options={{ title: "Поиск" }} />
      <Tabs.Screen name="create" options={{ title: "Создать" }} />
      <Tabs.Screen name="inbox" options={{ title: "Сообщения" }} />
      <Tabs.Screen name="profile" options={{ title: "Профиль" }} />
    </Tabs>
  );
}