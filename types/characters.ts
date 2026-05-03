// types/characters.ts

export interface Character {
  id: string;
  name: string;
  emoji: string;
  price: number;
  gestureType: "victory" | "crossed_arms" | "hand_above_head" | "kamehameha" | "rasengan" | "gum_gum" | "sharingan";
  gestureName: string;
  gestureDescription: string;
  gestureInstructions: string[];
  previewImage: string;
  isPremium: boolean;
  rarity: "common" | "rare" | "epic" | "legendary";
}

// MODIFIE ICI : Ajoute ou modifie tes personnages
export const characters: Character[] = [
  {
    id: "ninja_legend",
    name: "Ninja Légendaire",
    emoji: "🥷",
    price: 0,
    gestureType: "rasengan",
    gestureName: "NINJA SPIN",
    gestureDescription: "Tourne ta paume vers le haut comme une boule d'énergie",
    gestureInstructions: [
      "Lève ta main droite devant toi",
      "Fais un mouvement circulaire avec ton poignet",
      "Imagine une boule d'énergie qui tourne"
    ],
    previewImage: "/characters/ninja.png",
    isPremium: false,
    rarity: "common"
  },
  {
    id: "saiyan_warrior",
    name: "Guerrier Saiyan",
    emoji: "⚡",
    price: 0,
    gestureType: "kamehameha",
    gestureName: "ENERGY WAVE",
    gestureDescription: "Mains en coupe devant la poitrine",
    gestureInstructions: [
      "Place tes mains en coupe devant toi",
      "Rassemble ton énergie imaginaire",
      "Pousse tes mains vers l'avant"
    ],
    previewImage: "/characters/saiyan.png",
    isPremium: false,
    rarity: "common"
  },
  {
    id: "pirate_king",
    name: "Roi des Pirates",
    emoji: "🏴‍☠️",
    price: 0,
    gestureType: "gum_gum",
    gestureName: "GOMU PUNCH",
    gestureDescription: "Le poing élastique",
    gestureInstructions: [
      "Tend ton bras droit vers l'avant",
      "Ferme ton poing",
      "Imagine ton bras qui s'allonge"
    ],
    previewImage: "/characters/pirate.png",
    isPremium: false,
    rarity: "common"
  },
  {
    id: "dark_shinobi",
    name: "Shinobi des Ombres",
    emoji: "🌑",
    price: 499,
    gestureType: "sharingan",
    gestureName: "SHADOW STRIKE",
    gestureDescription: "La griffe de l'ombre",
    gestureInstructions: [
      "Place ta main en forme de griffe",
      "Courbe légèrement les doigts",
      "Avance rapidement vers la caméra"
    ],
    previewImage: "/characters/dark.png",
    isPremium: true,
    rarity: "rare"
  },
  {
    id: "cyber_samurai",
    name: "Samouraï Cyber",
    emoji: "🤖",
    price: 499,
    gestureType: "crossed_arms",
    gestureName: "CYBER SLASH",
    gestureDescription: "L'attaque du samouraï futuriste",
    gestureInstructions: [
      "Croise les bras sur ta poitrine",
      "Concentre ton énergie",
      "Tend les bras vers l'avant"
    ],
    previewImage: "/characters/samurai.png",
    isPremium: true,
    rarity: "rare"
  },
  {
    id: "dragon_god",
    name: "Dieu Dragon",
    emoji: "🐉",
    price: 999,
    gestureType: "hand_above_head",
    gestureName: "DRAGON ROAR",
    gestureDescription: "Le rugissement du dragon céleste",
    gestureInstructions: [
      "Lève les mains au-dessus de ta tête",
      "Fais un geste de griffe",
      "Crie comme un dragon"
    ],
    previewImage: "/characters/dragon.png",
    isPremium: true,
    rarity: "legendary"
  }
];

// Le reste du fichier reste identique...
export const gestureConfigs = {
  victory: {
    name: "V de la victoire",
    detect: (landmarks: any[]) => detectVictoryGesture(landmarks),
    threshold: 0.7
  },
  crossed_arms: {
    name: "Bras croisés",
    detect: (landmarks: any[]) => detectCrossedArms(landmarks),
    threshold: 0.6
  },
  hand_above_head: {
    name: "Main au-dessus de la tête",
    detect: (landmarks: any[]) => detectHandAboveHead(landmarks),
    threshold: 0.65
  },
  kamehameha: {
    name: "Kamehameha",
    detect: (landmarks: any[]) => detectKamehameha(landmarks),
    threshold: 0.8
  },
  rasengan: {
    name: "Rasengan",
    detect: (landmarks: any[]) => detectRasengan(landmarks),
    threshold: 0.75
  },
  gum_gum: {
    name: "Gomu Gomu",
    detect: (landmarks: any[]) => detectGumGum(landmarks),
    threshold: 0.7
  },
  sharingan: {
    name: "Chidori",
    detect: (landmarks: any[]) => detectChidori(landmarks),
    threshold: 0.8
  }
};

// ========== FONCTIONS DE DÉTECTION ==========
// (garde toutes les fonctions de détection que tu avais)
// ... elles restent identiques ...

const detectVictoryGesture = (landmarks: any[]) => {
  if (!landmarks || landmarks.length === 0) return false;
  const leftHand = landmarks.slice(15, 22);
  const rightHand = landmarks.slice(22, 29);
  
  const checkHand = (hand: any[]) => {
    if (!hand || hand.length < 5) return false;
    const indexTip = hand[4]?.y;
    const middleTip = hand[3]?.y;
    const ringTip = hand[2]?.y;
    const pinkyTip = hand[1]?.y;
    if (indexTip && middleTip && ringTip && pinkyTip) {
      return indexTip < ringTip && middleTip < ringTip && indexTip < pinkyTip && middleTip < pinkyTip;
    }
    return false;
  };
  return checkHand(leftHand) || checkHand(rightHand);
};

const detectCrossedArms = (landmarks: any[]) => {
  if (!landmarks || landmarks.length === 0) return false;
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[22];
  if (leftWrist && rightWrist) {
    const distance = Math.abs(leftWrist.x - rightWrist.x);
    return distance < 0.15;
  }
  return false;
};

const detectHandAboveHead = (landmarks: any[]) => {
  if (!landmarks || landmarks.length === 0) return false;
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[22];
  const nose = landmarks[0];
  if (leftWrist && rightWrist && nose) {
    const leftAbove = leftWrist.y < nose.y - 0.1;
    const rightAbove = rightWrist.y < nose.y - 0.1;
    return leftAbove || rightAbove;
  }
  return false;
};

const detectKamehameha = (landmarks: any[]) => {
  if (!landmarks || landmarks.length === 0) return false;
  const leftWrist = landmarks[15];
  const rightWrist = landmarks[22];
  const leftElbow = landmarks[13];
  const rightElbow = landmarks[20];
  
  if (leftWrist && rightWrist && leftElbow && rightElbow) {
    const handsTogether = Math.abs(leftWrist.x - rightWrist.x) < 0.1;
    const elbowsApart = Math.abs(leftElbow.x - rightElbow.x) > 0.3;
    const handsAtChest = leftWrist.y > 0.4 && leftWrist.y < 0.6;
    return handsTogether && elbowsApart && handsAtChest;
  }
  return false;
};

const detectRasengan = (landmarks: any[]) => {
  if (!landmarks || landmarks.length === 0) return false;
  const rightWrist = landmarks[22];
  const rightElbow = landmarks[20];
  const leftHand = landmarks[15];
  
  if (rightWrist && rightElbow && leftHand) {
    const rightHandExtended = rightWrist.y < rightElbow.y - 0.1;
    const leftHandSupporting = Math.abs(leftHand.x - rightWrist.x) < 0.15;
    const wristRotation = rightWrist.z < -0.1;
    return rightHandExtended && leftHandSupporting && wristRotation;
  }
  return false;
};

const detectGumGum = (landmarks: any[]) => {
  if (!landmarks || landmarks.length === 0) return false;
  const rightWrist = landmarks[22];
  const rightShoulder = landmarks[12];
  const leftWrist = landmarks[15];
  
  if (rightWrist && rightShoulder && leftWrist) {
    const rightArmExtended = rightWrist.y < rightShoulder.y - 0.2;
    const rightArmForward = rightWrist.z < -0.15;
    const leftArmFolded = leftWrist.y > landmarks[13]?.y;
    return rightArmExtended && rightArmForward && leftArmFolded;
  }
  return false;
};

const detectChidori = (landmarks: any[]) => {
  if (!landmarks || landmarks.length === 0) return false;
  const rightWrist = landmarks[22];
  const rightElbow = landmarks[20];
  const nose = landmarks[0];
  
  if (rightWrist && rightElbow && nose) {
    const handShape = rightWrist.z < -0.12;
    const handAtFace = Math.abs(rightWrist.y - nose.y) < 0.15;
    const elbowBent = rightElbow.y > rightWrist.y;
    return handShape && handAtFace && elbowBent;
  }
  return false;
};