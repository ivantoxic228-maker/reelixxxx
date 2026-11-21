import * as SecureStore from "expo-secure-store";
const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://reelixxxx-databaseurl-7d7d495d.up.railway.app";
export async function apiRequest<T>(path: string, options: RequestInit = {}, authenticated = false): Promise<T> {
  if (!API_URL) throw new Error("Сервер Reelix ещё не подключён. Нужен адрес опубликованного API.");
  const token = authenticated ? await SecureStore.getItemAsync("reelix_access_token") : null;
  const response = await fetch(`${API_URL.replace(/\/$/, "")}/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers ?? {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Не удалось выполнить запрос");
  return data as T;
}
