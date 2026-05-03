"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Video,
  History,
  Crown,
  Download,
  Share2,
  Trash2,
  Star,
  TrendingUp,
  User,
  LogOut,
  Menu,
  X,
  Wand2,
  Heart,
  Eye,
  Loader2,
  CheckCircle2,
  ShoppingBag,
  Coins,
  Trophy,
  Camera,
  CameraOff,
  Volume2,
  VolumeX,
  Settings
} from "lucide-react";
import CameraCapture from "@/components/CameraCapture";
import VideoEditor from "@/components/VideoEditor";
import LoadingOverlay from "@/components/LoadingOverlay";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { characters, type Character } from "@/types/characters";

interface Video {
  id: string;
  url: string;
  thumbnail: string;
  character_name: string;
  character_id: string;
  date: string;
  views: number;
  likes: number;
  resolution: string;
  status: "processing" | "completed" | "failed";
  created_at: string;
}

export default function DashboardPage() {
  // ========== ÉTAT ==========
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [credits, setCredits] = useState(5);
  const [coins, setCoins] = useState(100);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("studio");
  const [processingVideo, setProcessingVideo] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(characters[0]);
  const [ownedCharacters, setOwnedCharacters] = useState<string[]>(["ninja_legend", "saiyan_warrior", "pirate_king"]);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [characterToBuy, setCharacterToBuy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);
  const [showLoading, setShowLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState("720p");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showGestureGuide, setShowGestureGuide] = useState(false);

  const supabase = createClient();

  // ========== CHARGEMENT ==========
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setProfile(profile);
        setIsPremium(profile.subscription_tier === "premium");
        setCredits(profile.credits || 5);
        setCoins(profile.coins || 100);
      }

      const { data: userChars } = await supabase
        .from("user_characters")
        .select("character_id")
        .eq("user_id", user.id);

      if (userChars && userChars.length > 0) {
        setOwnedCharacters(userChars.map((c: any) => c.character_id));
      }

      const { data: userVideos } = await supabase
        .from("videos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (userVideos) {
        setVideos(userVideos);
      }

      setLoading(false);
    };

    loadUserData();
  }, [supabase]);

  // ========== FONCTIONS ==========
  const handleVideoGenerated = async (videoBlob: Blob) => {
    if (credits <= 0 && !isPremium) {
      toast.error("Plus de crédits ! Va dans l'onglet Premium");
      setActiveTab("upgrade");
      return;
    }

    setShowLoading(true);
    setLoadingMessage("🎬 Détection du geste...");
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    setLoadingMessage("✨ Génération de ton personnage anime...");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setLoadingMessage("🎨 Fusion entre réel et anime...");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setLoadingMessage("🌟 Application des effets magiques...");
    await new Promise((resolve) => setTimeout(resolve, 700));
    
    const videoUrl = URL.createObjectURL(videoBlob);
    setGeneratedVideo(videoUrl);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user && !isPremium) {
      const newCredits = credits - 1;
      setCredits(newCredits);
      await supabase
        .from("profiles")
        .update({ credits: newCredits })
        .eq("id", user.id);
      
      const newCoins = coins + 5;
      setCoins(newCoins);
      await supabase
        .from("profiles")
        .update({ coins: newCoins })
        .eq("id", user.id);
    }
    
    if (user) {
      await supabase.from("videos").insert([
        {
          user_id: user.id,
          video_url: videoUrl,
          character_name: selectedCharacter.name,
          character_id: selectedCharacter.id,
          resolution: selectedResolution,
          created_at: new Date().toISOString(),
        },
      ]);
      setVideos(prev => [...prev, {
        id: Date.now().toString(),
        url: videoUrl,
        thumbnail: "",
        character_name: selectedCharacter.name,
        character_id: selectedCharacter.id,
        date: new Date().toISOString(),
        views: 0,
        likes: 0,
        resolution: selectedResolution,
        status: "completed",
        created_at: new Date().toISOString(),
      }]);
    }
    
    setShowLoading(false);
    toast.success(`🎉 Tu es devenu ${selectedCharacter.name} !`);
  };

  const handleDownload = async (videoUrl: string) => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `morphstudio_${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Vidéo téléchargée !");
    } catch (error) {
      toast.error("Erreur lors du téléchargement");
    }
  };

  const handleShare = async (videoUrl: string) => {
    try {
      if (navigator.share && window.innerWidth < 768) {
        await navigator.share({
          title: "Ma transformation MorphStudio",
          text: `Je me suis transformé avec MorphStudio !`,
          url: videoUrl,
        });
        toast.success("Partage ouvert !");
      } else {
        await navigator.clipboard.writeText(videoUrl);
        toast.success("Lien copié dans le presse-papier !");
      }
    } catch (error) {
      toast.error("Erreur lors du partage");
    }
  };

  const handleOpenEditor = (videoUrl: string) => {
    setVideoToEdit(videoUrl);
    setShowEditor(true);
  };

  const handleSaveEditedVideo = (editedUrl: string) => {
    setGeneratedVideo(editedUrl);
    setShowEditor(false);
    toast.success("Vidéo modifiée avec succès !");
  };

  const handleSimulatePremium = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setShowLoading(true);
    setLoadingMessage("Activation du mode Premium...");
    
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const { error } = await supabase
      .from("profiles")
      .update({ 
        subscription_tier: "premium", 
        credits: 999999 
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Erreur lors de l'activation");
    } else {
      setIsPremium(true);
      setCredits(999999);
      toast.success("🎉 Mode Premium activé !");
      setTimeout(() => window.location.reload(), 1500);
    }
    
    setShowLoading(false);
  };

  const handleBuyCharacter = async (character: any) => {
    if (coins >= character.price) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setShowLoading(true);
      setLoadingMessage(`Déblocage de ${character.name}...`);
      
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newCoins = coins - character.price;
      setCoins(newCoins);
      setOwnedCharacters([...ownedCharacters, character.id]);
      
      await supabase
        .from("profiles")
        .update({ coins: newCoins })
        .eq("id", user.id);
      
      await supabase
        .from("user_characters")
        .insert([{ user_id: user.id, character_id: character.id }]);

      toast.success(`🎭 Tu as débloqué ${character.name} !`);
      setShowBuyModal(false);
      setShowLoading(false);
    } else {
      toast.error("Pas assez de MorphCoins ! Gagne-en en créant des vidéos.");
    }
  };

  const canUseCharacter = (character: any) => {
    return !character.isPremium || isPremium || ownedCharacters.includes(character.id);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnexion réussie");
    window.location.href = "/";
  };

  const toggleCamera = () => {
    setCameraEnabled(!cameraEnabled);
    toast.info(cameraEnabled ? "Caméra désactivée" : "Caméra activée");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-purple-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        <span className="ml-2 text-white">Chargement...</span>
      </div>
    );
  }

  // ========== RENDU ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {showLoading && <LoadingOverlay message={loadingMessage} />}

      {/* Sidebar mobile */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="absolute left-0 top-0 h-full w-64 bg-slate-900 p-4">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <span className="text-white font-bold">MorphStudio</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5 text-white" />
            </Button>
          </div>
          <SidebarContent activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="pt-8 mt-8 border-t border-white/10">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar desktop */}
        <aside className="hidden lg:block w-64 border-r border-white/10 min-h-screen p-4">
          <div className="flex items-center gap-2 mb-8 px-2">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <span className="text-xl font-bold text-white">MorphStudio</span>
          </div>
          <SidebarContent activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="pt-8 mt-8 border-t border-white/10">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Déconnexion
            </Button>
          </div>
        </aside>

        <main className="flex-1">
          {/* Header responsive */}
          <header className="border-b border-white/10 px-3 md:px-6 py-3 md:py-4 sticky top-0 z-40 bg-slate-900/95 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden text-white -ml-2"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                  <span className="text-sm md:text-lg font-bold text-white">MorphStudio</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 bg-yellow-500/10 rounded-full">
                  <Coins className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" />
                  <span className="text-xs md:text-sm text-yellow-400 font-medium">{coins}</span>
                </div>
                
                {!isPremium && (
                  <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 bg-yellow-500/10 rounded-full">
                    <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" />
                    <span className="text-xs md:text-sm text-yellow-400 font-medium">{credits}</span>
                  </div>
                )}
                
                {isPremium && (
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-xs py-0.5">
                    <Crown className="w-3 h-3 mr-1" />
                    <span className="hidden xs:inline">Premium</span>
                  </Badge>
                )}
                
                <Avatar className="w-7 h-7 md:w-8 md:h-8 ring-1 ring-purple-500/50 cursor-pointer">
                  <AvatarFallback className="bg-purple-600 text-xs">
                    {user?.email?.charAt(0).toUpperCase() || "👤"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <div className="p-3 md:p-6">
            {activeTab === "studio" && (
              <StudioContent
                generatedVideo={generatedVideo}
                onVideoGenerated={handleVideoGenerated}
                processing={processingVideo}
                isPremium={isPremium}
                credits={credits}
                selectedCharacter={selectedCharacter}
                setSelectedCharacter={setSelectedCharacter}
                characters={characters}
                ownedCharacters={ownedCharacters}
                canUseCharacter={canUseCharacter}
                onOpenEditor={handleOpenEditor}
                onBuyCharacter={(char) => {
                  setCharacterToBuy(char);
                  setShowBuyModal(true);
                }}
                onDownload={handleDownload}
                onShare={handleShare}
                cameraEnabled={cameraEnabled}
                toggleCamera={toggleCamera}
                selectedResolution={selectedResolution}
                setSelectedResolution={setSelectedResolution}
                audioEnabled={audioEnabled}
                setAudioEnabled={setAudioEnabled}
                showSettings={showSettings}
                setShowSettings={setShowSettings}
                showGestureGuide={showGestureGuide}
                setShowGestureGuide={setShowGestureGuide}
              />
            )}

            {activeTab === "history" && (
              <HistoryContent videos={videos} onDownload={handleDownload} />
            )}

            {activeTab === "shop" && (
              <ShopContent
                characters={characters}
                ownedCharacters={ownedCharacters}
                coins={coins}
                onBuyCharacter={handleBuyCharacter}
                isPremium={isPremium}
              />
            )}

            {activeTab === "upgrade" && (
              <UpgradeContent isPremium={isPremium} onSimulatePremium={handleSimulatePremium} />
            )}

            {activeTab === "profile" && (
              <ProfileContent 
                videos={videos} 
                coins={coins} 
                credits={credits} 
                isPremium={isPremium} 
                user={user} 
                onLogout={handleLogout}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {showBuyModal && characterToBuy && (
        <BuyCharacterModal
          character={characterToBuy}
          coins={coins}
          onConfirm={() => handleBuyCharacter(characterToBuy)}
          onClose={() => setShowBuyModal(false)}
        />
      )}

      {showEditor && videoToEdit && (
        <VideoEditor
          videoUrl={videoToEdit}
          onSave={handleSaveEditedVideo}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
}

// ========== SIDEBAR ==========
function SidebarContent({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const menuItems = [
    { id: "studio", label: "Studio", icon: Video },
    { id: "history", label: "Mes créations", icon: History },
    { id: "shop", label: "Boutique", icon: ShoppingBag },
    { id: "upgrade", label: "Premium", icon: Crown },
    { id: "profile", label: "Profil", icon: User },
  ];

  return (
    <nav className="space-y-2">
      {menuItems.map((item) => (
        <Button
          key={item.id}
          variant={activeTab === item.id ? "secondary" : "ghost"}
          className={`w-full justify-start ${
            activeTab === item.id
              ? "bg-purple-600 hover:bg-purple-700 text-white"
              : "text-gray-300 hover:text-white hover:bg-white/10"
          }`}
          onClick={() => setActiveTab(item.id)}
        >
          <item.icon className="w-4 h-4 mr-3" />
          {item.label}
        </Button>
      ))}
    </nav>
  );
}

// ========== STUDIO ==========
function StudioContent({ 
  generatedVideo, 
  onVideoGenerated, 
  processing, 
  isPremium, 
  credits,
  selectedCharacter,
  setSelectedCharacter,
  characters,
  ownedCharacters,
  canUseCharacter,
  onOpenEditor,
  onBuyCharacter,
  onDownload,
  onShare,
  cameraEnabled,
  toggleCamera,
  selectedResolution,
  setSelectedResolution,
  audioEnabled,
  setAudioEnabled,
  showSettings,
  setShowSettings,
  showGestureGuide,
  setShowGestureGuide
}: any) {

  return (
    <div className="max-w-7xl mx-auto">
      {/* Bannière crédits */}
      {!isPremium && credits <= 2 && credits > 0 && (
        <div className="mb-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <p className="text-white text-sm">Plus que {credits} crédit{credits !== 1 ? 's' : ''}</p>
            </div>
            <Button size="sm" className="bg-purple-600 text-xs py-1 h-8">
              Premium
            </Button>
          </div>
        </div>
      )}

      {/* Geste signature */}
      <div className="mb-4">
        <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30">
          <CardContent className="p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">{selectedCharacter.gestureName}</p>
                  <p className="text-xs text-gray-300 truncate">{selectedCharacter.gestureDescription}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowGestureGuide(!showGestureGuide)} className="text-xs">
                Guide
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Guide du geste */}
      {showGestureGuide && (
        <Card className="mb-4 bg-white/5 border-white/10">
          <CardContent className="p-4">
            <h3 className="text-white font-semibold text-sm mb-2">Comment faire "{selectedCharacter.gestureName}" ?</h3>
            <ul className="space-y-1">
              {selectedCharacter.gestureInstructions?.map((instruction: string, i: number) => (
                <li key={i} className="text-gray-300 text-xs">{i+1}. {instruction}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Layout principal */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Zone caméra - 2 colonnes */}
        <div className="lg:col-span-2">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  Capture
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)} className="text-white h-8">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* Bouton activation caméra */}
              <div className="mb-3">
                <Button
                  onClick={toggleCamera}
                  className={`w-full ${cameraEnabled ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} text-sm py-2`}
                >
                  {cameraEnabled ? (
                    <>
                      <CameraOff className="w-4 h-4 mr-2" />
                      Désactiver caméra
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      Activer caméra
                    </>
                  )}
                </Button>
              </div>

              {/* Paramètres */}
              {showSettings && (
                <div className="mb-3 p-3 bg-white/5 rounded-lg">
                  <h4 className="text-white font-semibold text-sm mb-2">Paramètres</h4>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <label className="text-xs text-gray-300 block mb-1">Résolution</label>
                      <div className="flex gap-1">
                        {["480p", "720p", "1080p"].map((res) => (
                          <Button
                            key={res}
                            size="sm"
                            variant={selectedResolution === res ? "default" : "outline"}
                            className={`${selectedResolution === res ? "bg-purple-600" : "text-white"} text-xs py-1 h-7 px-2`}
                            onClick={() => setSelectedResolution(res)}
                            disabled={!isPremium && res !== "480p"}
                          >
                            {res}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-300 block mb-1">Audio</label>
                      <Button size="sm" variant="outline" onClick={() => setAudioEnabled(!audioEnabled)} className="text-white h-7">
                        {audioEnabled ? "ON" : "OFF"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Caméra ou message désactivé */}
              {!cameraEnabled ? (
                <div className="text-center py-8 bg-black/30 rounded-lg">
                  <CameraOff className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Caméra désactivée</p>
                  <p className="text-xs text-gray-500 mt-1">Clique sur "Activer caméra"</p>
                </div>
              ) : (
                <CameraCapture 
                  onRecordingComplete={onVideoGenerated}
                  selectedCharacter={selectedCharacter}
                  cameraEnabled={cameraEnabled}
                />
              )}
              
              {processing && (
                <div className="mt-3 p-3 bg-purple-500/20 rounded-lg text-center">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1" />
                  <p className="text-white text-sm">Génération...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Personnages - 1 colonne */}
        <div className="space-y-4">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Star className="w-4 h-4" />
                Personnages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {characters.map((char: any) => {
                  const isOwned = ownedCharacters.includes(char.id);
                  const isAvailable = canUseCharacter(char);
                  
                  return (
                    <div key={char.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5">
                      <Button
                        variant={selectedCharacter.id === char.id ? "default" : "ghost"}
                        className={`flex-1 justify-start ${
                          selectedCharacter.id === char.id
                            ? "bg-purple-600"
                            : "text-white hover:bg-white/10"
                        } ${!isAvailable ? "opacity-50" : ""}`}
                        onClick={() => {
                          if (isAvailable) {
                            setSelectedCharacter(char);
                          } else {
                            toast.error(`Débloque ${char.name} dans la boutique !`);
                          }
                        }}
                      >
                        <span className="mr-2 text-xl">{char.emoji}</span>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-sm">{char.name}</p>
                          <p className="text-xs text-gray-400">{char.gestureName}</p>
                        </div>
                        {!isOwned && char.price > 0 && !isPremium && (
                          <span className="text-yellow-400 text-xs ml-2">{char.price}🪙</span>
                        )}
                      </Button>
                      {!isOwned && char.price > 0 && !isPremium && (
                        <Button size="sm" variant="ghost" onClick={() => onBuyCharacter(char)} className="ml-1">
                          <ShoppingBag className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Résultat vidéo */}
          {generatedVideo && (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 animate-in slide-in-from-right duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Transformation réussie !
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <video src={generatedVideo} controls className="w-full rounded-lg" />
                <div className="flex gap-2">
                  <Button className="flex-1 bg-purple-600 text-sm py-1" onClick={() => onOpenEditor(generatedVideo)}>
                    <Wand2 className="w-4 h-4 mr-1" />
                    Modifier
                  </Button>
                  <Button className="flex-1 bg-green-600 text-sm py-1" onClick={() => onDownload(generatedVideo)}>
                    <Download className="w-4 h-4 mr-1" />
                    Télécharger
                  </Button>
                  <Button variant="outline" className="text-white px-3" onClick={() => onShare(generatedVideo)}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== BOUTIQUE ==========
function ShopContent({ characters, ownedCharacters, coins, onBuyCharacter, isPremium }: any) {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Boutique</h2>
        <p className="text-gray-400 text-sm">Débloque de nouveaux personnages</p>
        <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-yellow-500/10 rounded-full">
          <Coins className="w-4 h-4 text-yellow-400" />
          <span className="text-white font-semibold text-sm">{coins} MorphCoins</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((char: any) => {
          const isOwned = ownedCharacters.includes(char.id);
          const canBuy = !isOwned && (!char.isPremium || !isPremium) && char.price > 0;
          
          return (
            <Card key={char.id} className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="text-center pb-2">
                <div className="text-5xl mb-2">{char.emoji}</div>
                <CardTitle className="text-white text-lg">{char.name}</CardTitle>
                <CardDescription className="text-gray-300 text-xs">{char.gestureName}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-gray-400 text-xs text-center">{char.gestureDescription}</p>
              </CardContent>
              <CardFooter>
                {isOwned ? (
                  <Badge className="w-full justify-center bg-green-500">Débloqué ✓</Badge>
                ) : canBuy ? (
                  <Button className="w-full bg-yellow-500 text-sm" onClick={() => onBuyCharacter(char)} disabled={coins < char.price}>
                    <Coins className="w-3 h-3 mr-1" />
                    {char.price} MorphCoins
                  </Button>
                ) : char.isPremium && !isPremium ? (
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-sm">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Button>
                ) : char.price === 0 ? (
                  <Badge className="w-full justify-center">Gratuit ✓</Badge>
                ) : null}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ========== PREMIUM (ANCIENNE MAQUETTE) ==========
function UpgradeContent({ isPremium, onSimulatePremium }: { isPremium: boolean; onSimulatePremium: () => void }) {
  if (isPremium) {
    return (
      <Card className="max-w-2xl mx-auto bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-center">
        <CardContent className="p-8 md:p-12">
          <Crown className="w-12 h-12 md:w-16 md:h-16 text-yellow-400 mx-auto mb-3" />
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">✨ Mode Premium Actif ✨</h2>
          <p className="text-gray-300 text-sm">Tu profites de toutes les fonctionnalités illimitées !</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Passe à l'expérience complète</h2>
        <p className="text-gray-400 text-sm">Débloque tout le potentiel de MorphStudio</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Offre Gratuite */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-xl">Gratuit</CardTitle>
            <CardDescription className="text-gray-300 text-sm">Pour commencer</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white mb-4">0€ <span className="text-sm font-normal text-gray-400">/mois</span></p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-gray-300 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-400" /> 5 vidéos gratuites
              </li>
              <li className="flex items-center gap-2 text-gray-300 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-400" /> 3 personnages gratuits
              </li>
              <li className="flex items-center gap-2 text-gray-300 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-400" /> Résolution 480p
              </li>
              <li className="flex items-center gap-2 text-gray-300 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-400" /> Watermark MorphStudio
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Offre Premium */}
        <Card className="bg-gradient-to-br from-purple-600 to-pink-600 border-0 shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-xl">Premium</CardTitle>
              <Badge className="bg-yellow-400 text-black text-xs">Mode Test</Badge>
            </div>
            <CardDescription className="text-purple-200 text-sm">Expérience ultime</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white mb-4">9.99€ <span className="text-sm font-normal text-purple-200">/mois</span></p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-white text-sm">
                <CheckCircle2 className="w-4 h-4" /> ✨ Vidéos illimitées
              </li>
              <li className="flex items-center gap-2 text-white text-sm">
                <CheckCircle2 className="w-4 h-4" /> ✨ Tous les personnages
              </li>
              <li className="flex items-center gap-2 text-white text-sm">
                <CheckCircle2 className="w-4 h-4" /> ✨ Résolution 1080p
              </li>
              <li className="flex items-center gap-2 text-white text-sm">
                <CheckCircle2 className="w-4 h-4" /> ✨ Sans watermark
              </li>
              <li className="flex items-center gap-2 text-white text-sm">
                <CheckCircle2 className="w-4 h-4" /> ✨ Support prioritaire
              </li>
            </ul>
            <Button className="w-full bg-white text-purple-600 hover:bg-gray-100" onClick={onSimulatePremium}>
              <Crown className="w-4 h-4 mr-2" />
              Activer Premium (Test)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ========== HISTORIQUE (ANCIENNE MAQUETTE) ==========
function HistoryContent({ videos, onDownload }: { videos: Video[]; onDownload: (url: string) => void }) {
  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <Video className="w-12 h-12 text-gray-500 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Aucune vidéo pour le moment</p>
        <p className="text-xs text-gray-500 mt-1">Crée ta première transformation dans l'onglet Studio</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video, index) => (
          <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 group hover:scale-105 transition-all duration-300">
            <CardContent className="p-0">
              <div className="relative">
                <div className="w-full h-48 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-t-lg flex flex-col items-center justify-center">
                  <div className="text-6xl mb-2">
                    {characters.find(c => c.id === video.character_id)?.emoji || "🎬"}
                  </div>
                  <p className="text-white font-semibold">{video.character_name}</p>
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" className="bg-purple-600">
                    <Eye className="w-4 h-4 mr-1" />
                    Voir
                  </Button>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" className="bg-green-600" onClick={() => onDownload(video.url)}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{video.character_name}</h3>
                  <Badge variant="outline" className="text-xs text-gray-400">
                    {new Date(video.created_at).toLocaleDateString()}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {video.views || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" /> {video.likes || 0}
                  </span>
                  <span className="text-xs">{video.resolution || "480p"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ========== PROFIL ==========
function ProfileContent({ videos, coins, credits, isPremium, user, onLogout }: any) {
  const level = Math.floor(videos.length / 5) + 1;

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-xl">Mon profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-purple-600 text-2xl">
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-white font-semibold">{user?.email}</h3>
              <p className="text-gray-400 text-sm">Niveau {level}</p>
              {isPremium && <Badge className="mt-1 text-xs">Premium</Badge>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white/5 rounded-lg text-center">
              <Coins className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{coins}</p>
              <p className="text-xs text-gray-400">Coins</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg text-center">
              <Video className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{videos.length}</p>
              <p className="text-xs text-gray-400">Vidéos</p>
            </div>
          </div>

          <Button variant="destructive" className="w-full" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ========== MODAL ACHAT ==========
function BuyCharacterModal({ character, coins, onConfirm, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <Card className="max-w-sm w-full bg-gradient-to-br from-slate-900 to-purple-900">
        <CardHeader>
          <CardTitle className="text-white text-center text-xl">Débloquer {character.name}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-6xl">{character.emoji}</div>
          <p className="text-gray-300 text-sm">Geste : {character.gestureName}</p>
          <div className="p-3 bg-yellow-500/10 rounded-lg">
            <p className="text-yellow-400 font-bold text-lg">{character.price} MorphCoins</p>
            <p className="text-xs text-gray-400">Ton solde : {coins} coins</p>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
          <Button onClick={onConfirm} className="flex-1 bg-yellow-500" disabled={coins < character.price}>
            Confirmer
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}