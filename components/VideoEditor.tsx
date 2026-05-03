"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Download,
  Wand2,
  Type,
  Sliders,
  Scissors,
  Music,
  Sparkles,
  Contrast,
  Sun,
  Droplet,
  FlipHorizontal,
  FlipVertical,
  RotateCw,
  Crop,
  Palette,
  Volume2,
  VolumeX
} from "lucide-react";
import { toast } from "sonner";

interface VideoEditorProps {
  videoUrl: string;
  onSave: (editedVideoUrl: string) => void;
  onClose: () => void;
}

export default function VideoEditor({ videoUrl, onSave, onClose }: VideoEditorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [textOverlay, setTextOverlay] = useState("");
  const [textColor, setTextColor] = useState("#ffffff");
  const [textPosition, setTextPosition] = useState("bottom");
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [isMuted, setIsMuted] = useState(false);

  const filters = {
    none: "Filtre normal",
    vintage: "Vintage",
    cyberpunk: "Cyberpunk",
    anime: "Anime Boost",
    blackwhite: "Noir & Blanc",
    sepia: "Sépia"
  };

  const getFilterStyle = () => {
    switch(selectedFilter) {
      case "vintage":
        return "sepia(0.5) contrast(1.2) brightness(0.9)";
      case "cyberpunk":
        return "hue-rotate(280deg) saturate(1.5) contrast(1.3)";
      case "anime":
        return "contrast(1.3) saturate(1.4) brightness(1.1)";
      case "blackwhite":
        return "grayscale(100%)";
      case "sepia":
        return "sepia(80%)";
      default:
        return `brightness(${brightness/100}) contrast(${contrast/100}) saturate(${saturation/100})`;
    }
  };

  const applyFilterToVideo = () => {
    if (videoRef.current) {
      videoRef.current.style.filter = getFilterStyle();
      toast.success("Filtre appliqué !");
    }
  };

  const handleSave = () => {
    // En attendant l'implémentation réelle, on simule la sauvegarde
    toast.success("Modifications sauvegardées !");
    onSave(videoUrl); // Pour l'instant on retourne la même vidéo
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Éditeur vidéo</h2>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-white">
            ✕
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 p-6">
          {/* Aperçu vidéo */}
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden bg-black">
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                className="w-full rounded-lg"
                style={{ filter: getFilterStyle() }}
              />
              {textOverlay && (
                <div
                  className={`absolute text-2xl font-bold px-4 py-2 bg-black/50 rounded-lg
                    ${textPosition === "top" ? "top-4 left-1/2 transform -translate-x-1/2" : ""}
                    ${textPosition === "center" ? "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" : ""}
                    ${textPosition === "bottom" ? "bottom-4 left-1/2 transform -translate-x-1/2" : ""}
                  `}
                  style={{ color: textColor }}
                >
                  {textOverlay}
                </div>
              )}
            </div>
            <Button onClick={applyFilterToVideo} className="w-full bg-purple-600">
              <Sparkles className="w-4 h-4 mr-2" />
              Appliquer les filtres
            </Button>
          </div>

          {/* Outils d'édition */}
          <div className="space-y-6">
            <Tabs defaultValue="filters" className="space-y-4">
              <TabsList className="bg-white/10">
                <TabsTrigger value="filters" className="text-white">
                  <Sliders className="w-4 h-4 mr-2" />
                  Filtres
                </TabsTrigger>
                <TabsTrigger value="text" className="text-white">
                  <Type className="w-4 h-4 mr-2" />
                  Texte
                </TabsTrigger>
                <TabsTrigger value="adjust" className="text-white">
                  <Palette className="w-4 h-4 mr-2" />
                  Ajustements
                </TabsTrigger>
                <TabsTrigger value="transform" className="text-white">
                  <Scissors className="w-4 h-4 mr-2" />
                  Transformation
                </TabsTrigger>
              </TabsList>

              {/* Onglet Filtres */}
              <TabsContent value="filters" className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(filters).map(([key, name]) => (
                    <Button
                      key={key}
                      variant={selectedFilter === key ? "default" : "outline"}
                      className={`justify-start ${
                        selectedFilter === key
                          ? "bg-purple-600"
                          : "text-white border-white/20"
                      }`}
                      onClick={() => setSelectedFilter(key)}
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      {name}
                    </Button>
                  ))}
                </div>
              </TabsContent>

              {/* Onglet Texte */}
              <TabsContent value="text" className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Texte à afficher</Label>
                  <Input
                    placeholder="Mon texte personnalisé..."
                    value={textOverlay}
                    onChange={(e) => setTextOverlay(e.target.value)}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Couleur du texte</Label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full h-10 rounded bg-white/10 border-white/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Position</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {["top", "center", "bottom"].map((pos) => (
                      <Button
                        key={pos}
                        variant={textPosition === pos ? "default" : "outline"}
                        className={textPosition === pos ? "bg-purple-600" : "text-white"}
                        onClick={() => setTextPosition(pos)}
                      >
                        {pos === "top" && "Haut"}
                        {pos === "center" && "Centre"}
                        {pos === "bottom" && "Bas"}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Onglet Ajustements */}
              <TabsContent value="adjust" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-white flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      Luminosité ({brightness}%)
                    </Label>
                    <Slider
                      value={[brightness]}
                      onValueChange={(val) => setBrightness(val[0])}
                      min={0}
                      max={200}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-white flex items-center gap-2">
                      <Contrast className="w-4 h-4" />
                      Contraste ({contrast}%)
                    </Label>
                    <Slider
                      value={[contrast]}
                      onValueChange={(val) => setContrast(val[0])}
                      min={0}
                      max={200}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-white flex items-center gap-2">
                      <Droplet className="w-4 h-4" />
                      Saturation ({saturation}%)
                    </Label>
                    <Slider
                      value={[saturation]}
                      onValueChange={(val) => setSaturation(val[0])}
                      min={0}
                      max={200}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-white flex items-center gap-2">
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      Audio
                    </Label>
                    <Button
                      variant="outline"
                      onClick={() => setIsMuted(!isMuted)}
                      className="w-full text-white"
                    >
                      {isMuted ? "Activer le son" : "Couper le son"}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Onglet Transformation */}
              <TabsContent value="transform" className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="text-white">
                    <RotateCw className="w-4 h-4 mr-2" />
                    Rotation 90°
                  </Button>
                  <Button variant="outline" className="text-white">
                    <FlipHorizontal className="w-4 h-4 mr-2" />
                    Miroir horizontal
                  </Button>
                  <Button variant="outline" className="text-white">
                    <FlipVertical className="w-4 h-4 mr-2" />
                    Miroir vertical
                  </Button>
                  <Button variant="outline" className="text-white">
                    <Crop className="w-4 h-4 mr-2" />
                    Rogner
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 p-6 border-t border-white/10">
          <Button variant="outline" onClick={onClose} className="text-white">
            Annuler
          </Button>
          <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
            <Download className="w-4 h-4 mr-2" />
            Sauvegarder les modifications
          </Button>
        </div>
      </div>
    </div>
  );
}