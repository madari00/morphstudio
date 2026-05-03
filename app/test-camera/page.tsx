"use client";

import CameraCapture from "@/components/CameraCapture";

export default function TestCameraPage() {
  const handleVideoGenerated = async (videoBlob: Blob) => {
    console.log("Vidéo reçue:", videoBlob);
    alert("Vidéo enregistrée ! Regarde la console pour voir le blob.");
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">Test Caméra</h1>
        <CameraCapture onRecordingComplete={handleVideoGenerated} />
      </div>
    </div>
  );
}