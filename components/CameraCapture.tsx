"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Video, Square, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { gestureConfigs, type Character } from "@/types/characters";

// Types pour MediaPipe
let PoseLandmarker: any = null;
let FilesetResolver: any = null;

interface CameraCaptureProps {
  onRecordingComplete: (videoBlob: Blob) => void;
  selectedCharacter: Character;
}

export default function CameraCapture({ onRecordingComplete, selectedCharacter }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [gestureDetected, setGestureDetected] = useState(false);
  const [detectionActive, setDetectionActive] = useState(true);
  const [mediaPipeLoading, setMediaPipeLoading] = useState(true);
  const poseLandmarkerRef = useRef<any>(null);
  const animationFrameRef = useRef<number>();

  // Initialiser MediaPipe
  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        setMediaPipeLoading(true);
        
        // Charger MediaPipe dynamiquement
        const vision = await import("@mediapipe/tasks-vision");
        PoseLandmarker = vision.PoseLandmarker;
        FilesetResolver = vision.FilesetResolver;

        const filesetResolver = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );

        const poseLandmarker = await PoseLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numPoses: 1
        });

        poseLandmarkerRef.current = poseLandmarker;
        setMediaPipeLoading(false);
        console.log("✅ MediaPipe initialisé avec succès");
        toast.success("Détection des gestes active !");
      } catch (error) {
        console.error("❌ Erreur MediaPipe:", error);
        setMediaPipeLoading(false);
        toast.error("Impossible d'initialiser la détection de geste");
      }
    };

    initMediaPipe();

    return () => {
      if (poseLandmarkerRef.current) {
        poseLandmarkerRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Démarrer la caméra
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraReady(true);
          console.log("✅ Caméra démarrée");
        }
      } catch (error) {
        console.error("❌ Erreur caméra:", error);
        toast.error("Impossible d'accéder à la caméra. Vérifie les permissions.");
      }
    };
    
    startCamera();

    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Détection du geste
  useEffect(() => {
    if (!cameraReady || !videoRef.current || recording || !detectionActive || mediaPipeLoading) return;

    const video = videoRef.current;
    let isDetecting = true;

    const detectFrame = () => {
      if (!isDetecting) return;
      if (!video || video.readyState !== 4) {
        animationFrameRef.current = requestAnimationFrame(detectFrame);
        return;
      }

      if (poseLandmarkerRef.current && video.videoWidth > 0) {
        try {
          const results = poseLandmarkerRef.current.detectForVideo(video, performance.now());
          
          if (results.landmarks && results.landmarks.length > 0 && selectedCharacter) {
            const landmarks = results.landmarks[0];
            const gestureConfig = gestureConfigs[selectedCharacter.gestureType];
            
            if (gestureConfig && gestureConfig.detect(landmarks)) {
              if (!gestureDetected && !recording) {
                setGestureDetected(true);
                toast.success(`✨ Geste "${selectedCharacter.gestureName}" détecté !`, {
                  description: "Démarrage de l'enregistrement...",
                  duration: 2000
                });
                startRecording();
              }
            }
          }
        } catch (error) {
          console.error("Erreur détection:", error);
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(detectFrame);
    };

    detectFrame();

    return () => {
      isDetecting = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cameraReady, recording, detectionActive, selectedCharacter, mediaPipeLoading]);

  const startRecording = () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    
    setRecording(true);
    setDetectionActive(false);
    
    const stream = videoRef.current.srcObject as MediaStream;
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    
    const chunks: BlobPart[] = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      onRecordingComplete(blob);
      setRecording(false);
      setDetectionActive(true);
      setGestureDetected(false);
    };
    
    mediaRecorder.start();
    
    // Arrêt après 8 secondes
    setTimeout(() => {
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
        toast.success("Enregistrement terminé !");
      }
    }, 8000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      toast.info("Enregistrement arrêté");
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {!cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            <p className="ml-2 text-white">Caméra en attente...</p>
          </div>
        )}
        
        {mediaPipeLoading && cameraReady && (
          <div className="absolute top-4 left-4 bg-black/70 rounded-lg px-3 py-1">
            <Loader2 className="w-4 h-4 animate-spin inline mr-2 text-purple-400" />
            <span className="text-white text-sm">Initialisation détection...</span>
          </div>
        )}
        
        {cameraReady && !recording && detectionActive && !gestureDetected && !mediaPipeLoading && (
          <div className="absolute bottom-4 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-center">
            <div className="inline-block px-4 py-2 bg-purple-600/90 rounded-full">
              <Sparkles className="w-4 h-4 inline mr-2" />
              <span className="text-white text-sm">
                Fais le geste : {selectedCharacter?.gestureName || "?"}
              </span>
            </div>
          </div>
        )}
        
        {gestureDetected && !recording && (
          <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center animate-pulse">
            <div className="text-center">
              <div className="text-6xl mb-2">✨</div>
              <p className="text-white font-bold text-xl">Geste détecté !</p>
              <p className="text-white">Enregistrement en cours...</p>
            </div>
          </div>
        )}
        
        {recording && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-sm">Enregistrement...</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-center gap-4">
        {!recording && (
          <Button onClick={startRecording} className="bg-purple-600" disabled={!cameraReady}>
            <Video className="w-4 h-4 mr-2" />
            Enregistrement manuel
          </Button>
        )}
        
        {recording && (
          <Button onClick={stopRecording} variant="destructive">
            <Square className="w-4 h-4 mr-2" />
            Arrêter
          </Button>
        )}
      </div>
    </div>
  );
}