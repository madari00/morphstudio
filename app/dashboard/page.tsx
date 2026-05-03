"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
  Star,
  Coins,
  LogOut,
  Menu,
  X,
  Film,
  Wand2,
  Loader2,
  CheckCircle2,
  ShoppingBag,
  Trophy,
  User,
} from "lucide-react";
import CameraCapture from "@/components/CameraCapture";
import VideoEditor from "@/components/VideoEditor";
import { toast } from "sonner";
import { characters, type Character } from "@/types/characters";

// Types
interface VideoType {
  id: string;
  video_url: string;
  thumbnail_url: string;
  character_name: string;
  character_id: string;
  created_at: string;
  views: number;
  likes: number;
}

interface Profile {
  id: string;
  username: string;
  email: string;
  credits: number;
  coins: number;
  subscription_tier: string;
}

// Composant Sidebar
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

// Contenu Studio
function StudioContent({ 
  generatedVideo, 
  onVideoGenerated, 
  processing, 
  selectedCharacter,
  setSelectedCharacter,
  characters: chars = [],
  isCharacterUnlocked,
  onOpenEditor,
  onBuyCharacter,
  credits,
  isPremium
}: any) {
  const [showGestureGuide, setShowGestureGuide] = useState(false);

  if (!selectedCharacter) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
        <p className="text-white">Chargement des personnages...</p>
      </Card>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Bannière geste */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-white font-semibold">Geste signature : {selectedCharacter.gestureName}</p>
                  <p className="text-sm text-gray-300">{selectedCharacter.gestureDescription}</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setShowGestureGuide(!showGestureGuide)}>
                Voir le guide
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {showGestureGuide && (
        <Card className="mb-8 bg-white/5 border-white/10">
          <CardContent className="p-6">
            <h3 className="text-white font-semibold mb-4">Comment faire "{selectedCharacter.gestureName}" ?</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                {selectedCharacter.gestureInstructions?.map((instruction: string, i: number) => (
                  <p key={i} className="text-gray-300">{i+1}. {instruction}</p>
                ))}
              </div>
              <div className="bg-black/30 rounded-lg p-4 text-center">
                <div className="text-6xl mb-2">{selectedCharacter.emoji}</div>
                <p className="text-purple-400">{selectedCharacter.gestureName}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-2xl flex items-center gap-2">
                <Wand2 className="w-6 h-6" />
                Capture magique
              </CardTitle>
              <CardDescription className="text-gray-300">
                Fais le geste du {selectedCharacter.gestureName} pour te transformer en {selectedCharacter.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CameraCapture 
                onRecordingComplete={onVideoGenerated}
                selectedCharacter={selectedCharacter}
              />
              {!isPremium && credits === 0 && (
                <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg">
                  <p className="text-sm text-yellow-400 text-center">⚠️ Plus de crédits ! Passe à Premium pour continuer.</p>
                </div>
              )}
              {processing && (
                <div className="mt-4 p-4 bg-purple-500/20 rounded-lg text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <p className="text-white">Génération en cours...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">Personnages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {chars.map((char: Character) => {
                  const unlocked = isCharacterUnlocked ? isCharacterUnlocked(char) : false;
                  return (
                    <div key={char.id} className="flex items-center gap-2">
                      <Button
                        variant={selectedCharacter.id === char.id ? "default" : "ghost"}
                        className={`flex-1 justify-start ${selectedCharacter.id === char.id ? "bg-purple-600" : "text-white hover:bg-white/10"} ${!unlocked ? "opacity-50" : ""}`}
                        onClick={() => unlocked && setSelectedCharacter(char)}
                        disabled={!unlocked}
                      >
                        <span className="mr-2 text-xl">{char.emoji}</span>
                        <div className="flex-1 text-left">
                          <p className="font-medium">{char.name}</p>
                          <p className="text-xs text-gray-400">{char.gestureName}</p>
                        </div>
                      </Button>
                      {!unlocked && onBuyCharacter && (
                        <Button size="sm" variant="ghost" onClick={() => onBuyCharacter(char)}>
                          <ShoppingBag className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {generatedVideo && (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 animate-in slide-in-from-right">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Transformation réussie !
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <video src={generatedVideo} controls className="w-full rounded-lg" />
                <div className="flex gap-2">
                  <Button className="flex-1 bg-purple-600" onClick={() => onOpenEditor(generatedVideo)}>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                  <Button variant="outline" className="text-white">
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

// Contenu Historique
function HistoryContent({ videos }: { videos: VideoType[] }) {
  if (videos.length === 0) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm text-center p-12">
        <Video className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-400">Aucune vidéo créée pour le moment</p>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <Card key={video.id} className="bg-white/10 backdrop-blur-sm border-white/20 group hover:scale-105 transition-all">
          <CardContent className="p-0">
            <div className="relative">
              <img src={video.thumbnail_url || "/api/placeholder/400/300"} alt={video.character_name} className="w-full h-48 object-cover rounded-t-lg" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button size="sm" className="bg-purple-600">Voir</Button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{video.character_name}</h3>
                <Badge variant="outline" className="text-xs">
                  {new Date(video.created_at).toLocaleDateString()}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <span className="flex items-center gap-1">👁️ {video.views}</span>
                <span className="flex items-center gap-1">❤️ {video.likes}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Contenu Boutique
function ShopContent({ characters: chars = [], ownedCharacters = [], coins, onBuyCharacter, isPremium }: any) {
  if (!chars || chars.length === 0) {
    return (
      <Card className="bg-white/10 p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
        <p className="text-white">Chargement des personnages...</p>
      </Card>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Boutique des personnages</h2>
        <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-yellow-500/10 rounded-full">
          <Coins className="w-5 h-5 text-yellow-400" />
          <span className="text-white">{coins} MorphCoins</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chars.map((char: Character) => {
          const isOwned = ownedCharacters.includes(char.id);
          const canBuy = !isOwned && (!char.isPremium || isPremium);
          
          return (
            <Card key={char.id} className={`bg-white/10 backdrop-blur-sm border-white/20 ${isOwned ? "opacity-75" : ""}`}>
              <CardHeader className="text-center">
                <div className="text-6xl mb-2">{char.emoji}</div>
                <CardTitle className="text-white">{char.name}</CardTitle>
                <CardDescription className="text-gray-300">{char.gestureName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-white/5 rounded-lg mb-4">
                  <p className="text-sm text-gray-400 text-center">Geste : {char.gestureDescription}</p>
                </div>
                <p className="text-center text-yellow-400 font-bold">{char.price} MorphCoins</p>
              </CardContent>
              <CardFooter>
                {isOwned ? (
                  <Badge className="w-full justify-center bg-green-500">Débloqué ✓</Badge>
                ) : canBuy ? (
                  <Button className="w-full bg-yellow-500 hover:bg-yellow-600" onClick={() => onBuyCharacter(char)} disabled={coins < char.price}>
                    <Coins className="w-4 h-4 mr-2" />
                    Débloquer ({char.price})
                  </Button>
                ) : (
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500" disabled>
                    <Crown className="w-4 h-4 mr-2" />
                    Premium requis
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Contenu Premium
function UpgradeContent({ isPremium, userId }: { isPremium: boolean; userId?: string }) {
  if (isPremium) {
    return (
      <Card className="max-w-2xl mx-auto bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-center p-12">
        <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Vous êtes Premium !</h2>
        <p className="text-gray-300">Profitez de toutes les fonctionnalités sans limitation.</p>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">Passez à Premium</h2>
        <p className="text-gray-300">Débloquez tout le potentiel de MorphStudio</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="bg-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Gratuit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-white mb-6">0€<span className="text-sm font-normal text-gray-400">/mois</span></p>
            <ul className="space-y-2 text-gray-300">
              <li>✓ 5 vidéos par mois</li>
              <li>✓ Personnages gratuits</li>
              <li>✓ Résolution 480p</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600 to-pink-600">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Premium</CardTitle>
              <Badge className="bg-yellow-400 text-black">Populaire</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-white mb-6">9.99€<span className="text-sm font-normal text-purple-200">/mois</span></p>
            <ul className="space-y-2 text-white mb-6">
              <li>✓ Vidéos illimitées</li>
              <li>✓ Tous les personnages</li>
              <li>✓ Résolution 1080p</li>
              <li>✓ Sans watermark</li>
            </ul>
            <Button className="w-full bg-white text-purple-600 hover:bg-gray-100">
              <Crown className="w-4 h-4 mr-2" />
              S'abonner (bientôt disponible)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Contenu Profil
function ProfileContent({ profile, videosCount }: { profile: Profile | null; videosCount: number }) {
  const level = Math.floor(videosCount / 5) + 1;
  const nextLevelVideos = level * 5;
  const progress = (videosCount / nextLevelVideos) * 100;

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="bg-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Mon profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-purple-600 text-3xl">{profile.username?.[0]?.toUpperCase() || "👤"}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold text-white">{profile.username}</h3>
              <p className="text-gray-400">{profile.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-300">Niveau {level}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-300">
              <span>Progression</span>
              <span>{videosCount} / {nextLevelVideos} vidéos</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="border-t border-white/10 pt-6">
            <h4 className="text-white font-semibold mb-4">Ressources</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white/5 rounded-lg text-center">
                <Coins className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{profile.coins}</p>
                <p className="text-sm text-gray-400">MorphCoins</p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg text-center">
                <Film className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{videosCount}</p>
                <p className="text-sm text-gray-400">Vidéos créées</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Modal d'achat
function BuyCharacterModal({ character, coins, onConfirm, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <Card className="max-w-md w-full bg-gradient-to-br from-slate-900 to-purple-900">
        <CardHeader className="text-center">
          <div className="text-8xl mb-2">{character.emoji}</div>
          <CardTitle className="text-white text-2xl">{character.name}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-300">Geste : {character.gestureName}</p>
          <p className="text-gray-400">{character.gestureDescription}</p>
          <div className="p-4 bg-yellow-500/10 rounded-lg">
            <p className="text-yellow-400 font-bold text-xl">{character.price} MorphCoins</p>
            <p className="text-sm text-gray-400">Ton solde : {coins} MorphCoins</p>
          </div>
        </CardContent>
        <CardFooter className="flex gap-4">
          <Button variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
          <Button onClick={onConfirm} className="flex-1 bg-yellow-500 hover:bg-yellow-600" disabled={coins < character.price}>
            Confirmer
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Composant principal
export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [processingVideo, setProcessingVideo] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(characters[0]);
  const [activeTab, setActiveTab] = useState("studio");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [characterToBuy, setCharacterToBuy] = useState<Character | null>(null);
  const [ownedCharacters, setOwnedCharacters] = useState<string[]>([]);
  
  const router = useRouter();
  const supabase = createClient();

  // Charger les données utilisateur
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
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
      }
      
      const { data: userChars } = await supabase
        .from("user_characters")
        .select("character_id")
        .eq("user_id", user.id);
      
      if (userChars) {
        setOwnedCharacters(userChars.map(c => c.character_id));
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
  }, [supabase, router]);

  const handleVideoGenerated = async (videoBlob: Blob) => {
    if (profile && profile.credits <= 0 && profile.subscription_tier !== "premium") {
      toast.error("Plus de crédits ! Passe à Premium pour continuer.");
      setActiveTab("upgrade");
      return;
    }

    setProcessingVideo(true);
    toast.loading(`✨ Transformation en ${selectedCharacter.name}...`);
    
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    const videoUrl = URL.createObjectURL(videoBlob);
    setGeneratedVideo(videoUrl);
    
    if (profile && profile.subscription_tier !== "premium") {
      await supabase
        .from("profiles")
        .update({ credits: profile.credits - 1 })
        .eq("id", profile.id);
      
      setProfile({ ...profile, credits: profile.credits - 1 });
    }
    
    setProcessingVideo(false);
    toast.success(`🎉 Transformation terminée ! Tu es devenu ${selectedCharacter.name}`);
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

  const handleBuyCharacter = async (character: Character) => {
    if (!profile || profile.coins < character.price) {
      toast.error("Pas assez de MorphCoins !");
      return;
    }
    
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ coins: profile.coins - character.price })
      .eq("id", profile.id);
    
    if (updateError) {
      toast.error("Erreur lors de l'achat");
      return;
    }
    
    const { error: insertError } = await supabase
      .from("user_characters")
      .insert({ user_id: profile.id, character_id: character.id });
    
    if (insertError) {
      toast.error("Erreur lors du déblocage du personnage");
      return;
    }
    
    setProfile({ ...profile, coins: profile.coins - character.price });
    setOwnedCharacters([...ownedCharacters, character.id]);
    setShowBuyModal(false);
    toast.success(`🎭 ${character.name} débloqué !`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    toast.success("Déconnecté");
  };

  const isCharacterUnlocked = (character: Character) => {
    if (!character.isPremium) return true;
    if (profile?.subscription_tier === "premium") return true;
    return ownedCharacters.includes(character.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        <p className="text-white ml-2">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Sidebar mobile */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="absolute left-0 top-0 h-full w-64 bg-slate-900 p-4">
          <div className="flex justify-between items-center mb-8">
            <span className="text-white font-bold">Menu</span>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <SidebarContent activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="pt-8 mt-8 border-t border-white/10">
            <Button variant="ghost" className="w-full justify-start text-red-400" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-3" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar desktop */}
        <aside className="hidden lg:block w-64 border-r border-white/10 min-h-screen p-4">
          <div className="flex items-center gap-2 mb-8 px-2">
            <Sparkles className="w-8 h-8 text-purple-400" />
            <span className="text-xl font-bold text-white">MorphStudio</span>
          </div>
          <SidebarContent activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="pt-8 mt-8 border-t border-white/10">
            <Button variant="ghost" className="w-full justify-start text-red-400" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-3" />
              Déconnexion
            </Button>
          </div>
        </aside>

        <main className="flex-1">
          <header className="border-b border-white/10 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="lg:hidden text-white" onClick={() => setSidebarOpen(true)}>
                  <Menu className="w-5 h-5" />
                </Button>
                <h1 className="text-xl font-semibold text-white">
                  {activeTab === "studio" && "Studio de création"}
                  {activeTab === "history" && "Mes créations"}
                  {activeTab === "shop" && "Boutique"}
                  {activeTab === "upgrade" && "Premium"}
                  {activeTab === "profile" && "Mon profil"}
                </h1>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-500/10 rounded-full">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-yellow-400">{profile?.coins || 0}</span>
                </div>
                
                {profile?.subscription_tier !== "premium" && (
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-yellow-500/10 rounded-full">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-yellow-400">{profile?.credits || 0} crédits</span>
                  </div>
                )}
                
                {profile?.subscription_tier === "premium" && (
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
                
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-white">{profile?.username || user?.email?.split("@")[0]}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                  <Avatar className="cursor-pointer hover:ring-2 hover:ring-purple-400">
                    <AvatarFallback className="bg-purple-600">
                      {profile?.username?.[0]?.toUpperCase() || "👤"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </header>

          <div className="p-6">
            {activeTab === "studio" && (
              <StudioContent
                generatedVideo={generatedVideo}
                onVideoGenerated={handleVideoGenerated}
                processing={processingVideo}
                selectedCharacter={selectedCharacter}
                setSelectedCharacter={setSelectedCharacter}
                characters={characters}
                isCharacterUnlocked={isCharacterUnlocked}
                onOpenEditor={handleOpenEditor}
                onBuyCharacter={(char: Character) => {
                  setCharacterToBuy(char);
                  setShowBuyModal(true);
                }}
                credits={profile?.credits || 0}
                isPremium={profile?.subscription_tier === "premium"}
              />
            )}

            {activeTab === "history" && (
              <HistoryContent videos={videos} />
            )}

            {activeTab === "shop" && (
              <ShopContent
                characters={characters}
                ownedCharacters={ownedCharacters}
                coins={profile?.coins || 0}
                onBuyCharacter={handleBuyCharacter}
                isPremium={profile?.subscription_tier === "premium"}
              />
            )}

            {activeTab === "upgrade" && (
              <UpgradeContent isPremium={profile?.subscription_tier === "premium"} userId={user?.id} />
            )}

            {activeTab === "profile" && (
              <ProfileContent profile={profile} videosCount={videos.length} />
            )}
          </div>
        </main>
      </div>

      {showBuyModal && characterToBuy && (
        <BuyCharacterModal
          character={characterToBuy}
          coins={profile?.coins || 0}
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