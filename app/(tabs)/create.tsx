import { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, Alert, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { CameraView, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import { useAudioPlayer } from "expo-audio";
import { VideoView, useVideoPlayer } from "expo-video";
import { colors } from "../../src/theme";
import { pickVideo, uploadVideo, buildEditedVideoUrl } from "../../src/media";
import { apiRequest } from "../../src/api";

type Sound = { id: string; title: string; artist: string; audioUrl: string; publicId?: string | null; duration?: number };
function SoundRow({ sound, selected, onSelect }: { sound: Sound; selected: boolean; onSelect: () => void }) {
  return <Pressable style={styles.soundRow} onPress={onSelect}><View style={{flex:1}}><Text style={styles.soundName}>{sound.title}</Text><Text style={styles.soundArtist}>{sound.artist}</Text></View><Ionicons name={selected ? "checkmark-circle" : "play-circle-outline"} size={23} color={colors.violet}/></Pressable>;
}
function VideoPreview({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, p => { p.loop = true; });
  return <VideoView player={player} style={styles.preview} contentFit="contain" nativeControls />;
}
export default function CreateScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  const camera = useRef<CameraView | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [recording, setRecording] = useState(false);
  const [uri, setUri] = useState("");
  const [duration, setDuration] = useState(0);
  const [caption, setCaption] = useState("");
  const [overlayText, setOverlayText] = useState("");
  const [trimStart, setTrimStart] = useState("0");
  const [trimEnd, setTrimEnd] = useState("");
  const [filter, setFilter] = useState<"none" | "vivid" | "mono">("none");
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [soundId, setSoundId] = useState("");
  const [soundVolume, setSoundVolume] = useState("50");
  const selectedSound = sounds.find(s => s.id === soundId);
  const audioPlayer = useAudioPlayer(selectedSound?.audioUrl);
  const [showSounds, setShowSounds] = useState(false);
  const [busy, setBusy] = useState(false);
  useFocusEffect(useCallback(() => { setCameraActive(true); return () => { setCameraActive(false); camera.current?.stopRecording(); }; }, []));
  useEffect(() => { apiRequest<Sound[]>("/posts/sounds").then(setSounds).catch(() => setSounds([])); }, []);
  useEffect(() => { if (selectedSound) audioPlayer.play(); else audioPlayer.pause(); return () => audioPlayer.pause(); }, [soundId]);
  async function choose() {
    try {
      const selected = await pickVideo();
      if (selected) { setUri(selected.uri); setDuration(Math.max(0, (selected.duration || 0) / 1000)); setTrimStart("0"); setTrimEnd(String(Math.round((selected.duration || 0) / 1000))); }
    } catch (e) { Alert.alert("Не получилось выбрать видео", e instanceof Error ? e.message : "Попробуй ещё раз."); }
  }
  async function startRecording() {
    if (!camera.current || recording) return;
    if (!microphonePermission?.granted) {
      const result = await requestMicrophonePermission();
      if (!result.granted) { Alert.alert("Нужен микрофон", "Разреши запись звука, чтобы видео сохранялось со звуком."); return; }
    }
    setRecording(true);
    try {
      const result = await camera.current.recordAsync({ maxDuration: 180 });
      if (result?.uri) { setUri(result.uri); setDuration(0); setTrimStart("0"); setTrimEnd(""); }
    } catch (e) { Alert.alert("Ошибка съёмки", e instanceof Error ? e.message : "Не удалось записать видео."); }
    finally { setRecording(false); }
  }
  function stopRecording() { camera.current?.stopRecording(); }
  async function publish() {
    if (!uri || busy) return;
    const start = Math.max(0, Number(trimStart) || 0);
    const end = Number(trimEnd) > 0 ? Number(trimEnd) : (duration || 180);
    if (end <= start) { Alert.alert("Проверь обрезку", "Конец видео должен быть позже начала."); return; }
    setBusy(true);
    try {
      const uploaded = await uploadVideo({ uri, fileName: "reelix-clip.mp4", mimeType: "video/mp4" });
      const safeEnd = uploaded.duration ? Math.min(end, uploaded.duration) : end;
      if (safeEnd <= start) throw new Error("Время обрезки выходит за длительность видео.");
      const videoUrl = buildEditedVideoUrl(uploaded, { trimStart: start, trimEnd: safeEnd, filter, overlayText, soundPublicId: sounds.find(s => s.id === soundId)?.publicId || undefined, soundVolume: Number(soundVolume) || 50 });
      await apiRequest("/posts", { method: "POST", body: JSON.stringify({ videoUrl, publicId: uploaded.public_id, duration: Math.max(0.2, safeEnd - start), caption, soundId: soundId || undefined }) }, true);
      setUri(""); setCaption(""); setOverlayText(""); setSoundId(""); setSoundVolume("50"); setDuration(0); setTrimStart("0"); setTrimEnd("");
      Alert.alert("Опубликовано", "Видео добавлено в Reelix.");
    } catch (e) { Alert.alert("Не удалось опубликовать", e instanceof Error ? e.message : "Попробуй позже."); }
    finally { setBusy(false); }
  }
  if (!permission) return <View style={styles.center}><ActivityIndicator color={colors.violet}/></View>;
  if (!permission.granted) return <View style={styles.center}><Ionicons name="camera-outline" size={42} color={colors.violet}/><Text style={styles.heading}>Разреши доступ к камере</Text><Text style={styles.hint}>Камера и микрофон нужны для записи роликов со звуком.</Text><Pressable style={styles.primary} onPress={requestPermission}><Text style={styles.primaryText}>Разрешить</Text></Pressable></View>;
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}><Text style={styles.title}>Создать видео</Text><Text style={styles.brand}>REELIX STUDIO</Text></View>
      {!uri ? <>
        <View style={styles.cameraFrame}>
          {cameraActive && <CameraView ref={camera} style={StyleSheet.absoluteFill} facing={facing} mode="video" videoQuality="1080p" /> }
          <Pressable style={styles.flip} onPress={() => setFacing(v => v === "back" ? "front" : "back")}><Ionicons name="camera-reverse-outline" size={23} color="#fff"/></Pressable>
          <View style={styles.cameraControls}>
            <Pressable style={styles.gallery} onPress={choose}><Ionicons name="images-outline" size={23} color="#fff"/><Text style={styles.controlText}>Галерея</Text></Pressable>
            <Pressable style={[styles.record, recording && styles.recording]} onPress={recording ? stopRecording : startRecording}><View style={styles.recordInner}/></Pressable>
            <View style={styles.gallery}><Ionicons name="time-outline" size={23} color="#fff"/><Text style={styles.controlText}>До 3 мин</Text></View>
          </View>
        </View>
        <Text style={styles.hint}>Записывай вертикальное видео или выбери готовый ролик из галереи.</Text>
      </> : <>
        <VideoPreview uri={uri}/>
        <View style={styles.rowBetween}><Text style={styles.sectionTitle}>Монтаж</Text><Pressable onPress={() => setUri("")}><Text style={styles.link}>Выбрать другое</Text></Pressable></View>
        <Text style={styles.label}>ОБРЕЗКА · СЕКУНДЫ</Text>
        <View style={styles.trimRow}><View style={styles.trimField}><Text style={styles.fieldLabel}>Начало</Text><TextInput style={styles.input} keyboardType="decimal-pad" value={trimStart} onChangeText={setTrimStart}/></View><View style={styles.trimField}><Text style={styles.fieldLabel}>Конец</Text><TextInput style={styles.input} keyboardType="decimal-pad" value={trimEnd} onChangeText={setTrimEnd} placeholder={duration ? String(Math.round(duration)) : "180"} placeholderTextColor={colors.muted}/></View></View>
        <Text style={styles.label}>ФИЛЬТР</Text>
        <View style={styles.filters}>{([{key:"none",name:"Оригинал"},{key:"vivid",name:"Яркий"},{key:"mono",name:"Ч/Б"}] as const).map(x => <Pressable key={x.key} onPress={() => setFilter(x.key)} style={[styles.filter,filter===x.key&&styles.filterActive]}><Text style={[styles.filterText,filter===x.key&&styles.filterTextActive]}>{x.name}</Text></Pressable>)}</View>
        <Text style={styles.label}>ТЕКСТ НА ВИДЕО</Text><TextInput style={styles.input} value={overlayText} onChangeText={setOverlayText} maxLength={60} placeholder="Добавь надпись на ролик" placeholderTextColor={colors.muted}/>
        <Text style={styles.label}>ЗВУКОВАЯ БИБЛИОТЕКА</Text>
        <Pressable style={styles.soundPicker} onPress={() => setShowSounds(v => !v)}><Ionicons name="musical-notes-outline" size={20} color={colors.violet}/><Text style={styles.soundText}>{sounds.find(s => s.id === soundId)?.title || "Выбрать звук"}</Text><Ionicons name={showSounds ? "chevron-up" : "chevron-down"} size={18} color={colors.muted}/></Pressable>
        {showSounds && <View style={styles.soundList}>{sounds.map(s => <SoundRow key={s.id} sound={s} selected={soundId===s.id} onSelect={() => { if (soundId === s.id) { audioPlayer.pause(); setSoundId(""); } else setSoundId(s.id); }} />)}{!sounds.length && <Text style={styles.hint}>Библиотека пока пуста. Администратор может добавить лицензированные треки.</Text>}</View>}
        {!!soundId && <><Text style={styles.label}>ГРОМКОСТЬ МУЗЫКИ · 0–100%</Text><TextInput style={styles.input} value={soundVolume} onChangeText={value => setSoundVolume(value.replace(/[^0-9]/g, "").slice(0, 3))} keyboardType="number-pad" placeholder="50" placeholderTextColor={colors.muted}/></>}
        <Text style={styles.label}>ОПИСАНИЕ</Text><TextInput style={[styles.input,styles.caption]} value={caption} onChangeText={setCaption} multiline maxLength={2200} placeholder="Расскажи о своём видео..." placeholderTextColor={colors.muted}/>
        <Pressable style={styles.publish} onPress={publish} disabled={busy}>{busy?<ActivityIndicator color="#fff"/>:<Text style={styles.primaryText}>Опубликовать видео</Text>}</Pressable>
        <Text style={styles.hint}>Обрезка, фильтр и надпись применяются при обработке видео на Cloudinary. Выбранный трек прослушивается в редакторе и добавляется поверх оригинального звука при обработке Cloudinary.</Text>
      </>}
    </ScrollView>
  );
}
const styles=StyleSheet.create({
 screen:{flex:1,backgroundColor:colors.background},content:{padding:18,paddingBottom:36},header:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:18},title:{fontSize:25,fontWeight:"900",color:colors.text},brand:{fontSize:9,fontWeight:"900",letterSpacing:1.5,color:colors.violet},
 cameraFrame:{height:470,backgroundColor:"#111",overflow:"hidden",position:"relative"},flip:{position:"absolute",right:15,top:15,width:42,height:42,borderRadius:21,backgroundColor:"#0008",alignItems:"center",justifyContent:"center"},cameraControls:{position:"absolute",bottom:18,left:0,right:0,flexDirection:"row",alignItems:"center",justifyContent:"space-around"},gallery:{alignItems:"center",gap:4,minWidth:70},controlText:{color:"#fff",fontSize:10,fontWeight:"700"},record:{width:76,height:76,borderRadius:38,borderWidth:5,borderColor:"#fff",alignItems:"center",justifyContent:"center"},recordInner:{width:54,height:54,borderRadius:27,backgroundColor:"#FF365F"},recording:{borderColor:"#FF365F"},center:{flex:1,alignItems:"center",justifyContent:"center",padding:28,gap:14},heading:{fontSize:20,fontWeight:"800",color:colors.text},hint:{fontSize:11,color:colors.muted,lineHeight:17,marginTop:12},primary:{backgroundColor:colors.text,paddingHorizontal:28,paddingVertical:14,marginTop:8},primaryText:{color:"#fff",fontWeight:"800",fontSize:13},preview:{width:"100%",height:420,backgroundColor:"#111",marginBottom:16},rowBetween:{flexDirection:"row",alignItems:"center",justifyContent:"space-between"},sectionTitle:{fontSize:19,fontWeight:"800",color:colors.text},link:{color:colors.violet,fontSize:12,fontWeight:"700"},label:{fontSize:10,color:colors.muted,fontWeight:"900",letterSpacing:1.1,marginTop:20,marginBottom:8},trimRow:{flexDirection:"row",gap:10},trimField:{flex:1,gap:6},fieldLabel:{fontSize:11,color:colors.muted},input:{borderWidth:1,borderColor:colors.line,padding:12,color:colors.text,fontSize:13},filters:{flexDirection:"row",gap:8},filter:{borderWidth:1,borderColor:colors.line,paddingVertical:10,paddingHorizontal:16},filterActive:{backgroundColor:colors.violet,borderColor:colors.violet},filterText:{fontSize:11,color:colors.text,fontWeight:"700"},filterTextActive:{color:"#fff"},soundPicker:{flexDirection:"row",alignItems:"center",gap:10,borderWidth:1,borderColor:colors.line,padding:13},soundText:{flex:1,color:colors.text,fontSize:13,fontWeight:"700"},soundList:{borderWidth:1,borderColor:colors.line,borderTopWidth:0},soundRow:{padding:12,flexDirection:"row",alignItems:"center",borderBottomWidth:1,borderBottomColor:colors.line},soundName:{color:colors.text,fontSize:12,fontWeight:"700"},soundArtist:{color:colors.muted,fontSize:10,marginTop:3},caption:{minHeight:90,textAlignVertical:"top"},publish:{backgroundColor:colors.text,alignItems:"center",justifyContent:"center",padding:16,marginTop:20}
});
