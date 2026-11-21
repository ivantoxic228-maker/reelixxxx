const API_URL = process.env.EXPO_PUBLIC_API_URL;
export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!API_URL) throw new Error("Сервер Reelix ещё не подключён. Добавьте EXPO_PUBLIC_API_URL в настройки приложения.");
  const response = await fetch(`${API_URL.replace(/\/$/, "")}/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Не удалось выполнить запрос");
  return data as T;
}
