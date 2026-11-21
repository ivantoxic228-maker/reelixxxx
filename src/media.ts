import * as ImagePicker from "expo-image-picker";
import { apiRequest } from "./api";
type Signature = { cloudName: string; apiKey: string; timestamp: number; folder: string; signature: string };
type UploadResult = { secure_url: string; public_id: string; duration?: number };
export async function pickVideo() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) throw new Error("Разреши Reelix доступ к галерее.");
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["videos"], allowsEditing: false, quality: 1, videoMaxDuration: 180 });
  if (result.canceled || !result.assets[0]) return null;
  return result.assets[0];
}
export async function uploadVideo(asset: ImagePicker.ImagePickerAsset) {
  const sign = await apiRequest<Signature>("/media/signature", { method: "POST", body: JSON.stringify({}) }, true);
  const body = new FormData();
  body.append("file", { uri: asset.uri, name: asset.fileName || "reelix-video.mp4", type: asset.mimeType || "video/mp4" } as any);
  body.append("api_key", sign.apiKey);
  body.append("timestamp", String(sign.timestamp));
  body.append("folder", sign.folder);
  body.append("signature", sign.signature);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/video/upload`, { method: "POST", body });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message || "Не удалось загрузить видео");
  return result as UploadResult;
}
