import * as ImagePicker from "expo-image-picker";
import { apiRequest } from "./api";
type Signature = { cloudName: string; apiKey: string; timestamp: number; folder: string; signature: string };
type UploadResult = { secure_url: string; public_id: string; duration?: number; format?: string; cloudName: string };
export async function pickVideo() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) throw new Error("Разреши Reelix доступ к галерее.");
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["videos"], allowsEditing: false, quality: 1, videoMaxDuration: 180 });
  if (result.canceled || !result.assets[0]) return null;
  return result.assets[0];
}
export async function uploadVideo(asset: { uri: string; fileName?: string | null; mimeType?: string | null }) {
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
  return { ...result, cloudName: sign.cloudName } as UploadResult;
}
export function buildEditedVideoUrl(upload: UploadResult, options: { trimStart: number; trimEnd: number; filter: "none" | "vivid" | "mono"; overlayText: string; soundPublicId?: string }) {
  const transformations: string[] = [];
  if (options.filter === "vivid") transformations.push("e_saturation:35,e_contrast:10");
  if (options.filter === "mono") transformations.push("e_grayscale");
  if (options.trimStart > 0 || options.trimEnd < (upload.duration || options.trimEnd)) transformations.push(`so_${Math.max(0, options.trimStart)},eo_${Math.max(options.trimStart + 0.2, options.trimEnd)}`);
  if (options.overlayText.trim()) transformations.push(`l_text:Arial_48_bold:${encodeURIComponent(options.overlayText.trim())},co_white/fl_layer_apply,g_south,y_100`);
  if (options.soundPublicId) transformations.push(`l_audio:${options.soundPublicId.split("/").join(":")}/e_volume:50/fl_layer_apply`);
  if (!transformations.length) return upload.secure_url;
  const publicId = upload.public_id.split("/").map(encodeURIComponent).join("/");
  return `https://res.cloudinary.com/${upload.cloudName}/video/upload/${transformations.join("/")}/${publicId}.${upload.format || "mp4"}`;
}
