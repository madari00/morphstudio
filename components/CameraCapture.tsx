"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Video, Square, Sparkles, Loader2, CameraOff } from "lucide-react";
import { toast } from "sonner";
import { gestureConfigs, type Character } from "@/types/characters";

let PoseLandmarker: any = null;
let FilesetResolver: any = null;

interface CameraCaptureProps {
  onRecordingComplete: (videoBlob: Blob) => void;
  selectedCharacter: Character;
  cameraEnabled?: boolean;
}

export default function CameraCapture({ onRecordingComplete, selectedCharacter, cameraEnabled = true }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [gestureDetected, setGestureDetected] = useState(false);
  const [mediaPipeLoading, setMediaPipeLoading] = useState(true);
  const poseLandmarkerRef = useRef<any>(null);
  const animationFrameRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  // Initialiser MediaPipe
  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        setMediaPipeLoading(true);
        
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
        console.log("✅ MediaPipe initialisé");
      } catch (error) {
        console.error("❌ MediaPipe:", error);
        setMediaPipeLoading(false);
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

  // Gestion de la caméra
  useEffect(() => {
    if (!cameraEnabled) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setCameraReady(false);
      return;
    }

    const startCamera = async () => {
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: { ideal: 640 }, height: { ideal: 480 } } 
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraReady(true);
        }
      } catch (error) {
        console.error("❌ Caméra:", error);
        setCameraReady(false);
        toast.error("Impossible d'accéder à la caméra");
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraEnabled]);

  // Démarrer l'enregistrement
  const startRecording = () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    
    setRecording(true);
    setGestureDetected(false);
    chunksRef.current = [];
    
    const stream = videoRef.current.srcObject as MediaStream;
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      onRecordingComplete(blob);
      setRecording(false);
      chunksRef.current = [];
    };
    
    mediaRecorder.start();
    
    // Arrêt automatique après 5 secondes
    setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
        toast.success("Enregistrement terminé !");
      }
    }, 5000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      toast.info("Enregistrement arrêté");
    }
  };

  // Détection du geste
  useEffect(() => {
    if (!cameraReady || !videoRef.current || recording || mediaPipeLoading || !cameraEnabled) return;

    const video = videoRef.current;
    let frameRequest: number;

    const detectFrame = () => {
      if (!video || video.readyState !== 4 || recording || !cameraEnabled) {
        frameRequest = requestAnimationFrame(detectFrame);
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
                toast.success(`✨ Geste "${selectedCharacter.gestureName}" détecté !`);
                startRecording();
              }
            }
          }
        } catch (error) {
          console.error("Erreur détection:", error);
        }
      }
      
      frameRequest = requestAnimationFrame(detectFrame);
    };

    detectFrame();

    return () => {
      if (frameRequest) {
        cancelAnimationFrame(frameRequest);
      }
    };
  }, [cameraReady, recording, selectedCharacter, mediaPipeLoading, cameraEnabled]);

  return (
    <div className="space-y-3">
      <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {!cameraReady && cameraEnabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            <p className="ml-2 text-white text-sm">Caméra en attente...</p>
          </div>
        )}
        
        {cameraReady && !recording && !gestureDetected && !mediaPipeLoading && cameraEnabled && (
          <div className="absolute bottom-3 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-center">
            <div className="inline-block px-3 py-1 bg-purple-600/90 rounded-full">
              <Sparkles className="w-3 h-3 inline mr-1" />
              <span className="text-white text-xs">
                Geste : {selectedCharacter?.gestureName || "?"}
              </span>
            </div>
          </div>
        )}
        
        {gestureDetected && !recording && (
          <div className="absolute inset-0 bg-green-500/50 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl mb-1">✨</div>
              <p className="text-white font-bold text-sm">Geste détecté !</p>
            </div>
          </div>
        )}
        
        {recording && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded-full">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span className="text-xs">REC</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-center gap-3">
        {!recording && (
          <Button onClick={startRecording} size="sm" className="bg-purple-600" disabled={!cameraReady || !cameraEnabled}>
            <Video className="w-3 h-3 mr-1" />
            Manuel
          </Button>
        )}
        
        {recording && (
          <Button onClick={stopRecording} size="sm" variant="destructive">
            <Square className="w-3 h-3 mr-1" />
            Stop
          </Button>
        )}
      </div>
    </div>
  );
}