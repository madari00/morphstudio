import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function GET() {
  try {
    // Utiliser un modèle de génération d'image simple et gratuit
    // Ce modèle est public et accessible à tous
    const output = await replicate.run(
      "black-forest-labs/flux-schnell", // Modèle gratuit et rapide
      {
        input: {
          prompt: "a cute anime cat",
          go_fast: true,
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "webp",
        },
      }
    );
    
    console.log("✅ API fonctionne ! Résultat:", output);
    
    return NextResponse.json({ 
      success: true, 
      message: "API Replicate fonctionne !",
      imageUrl: output 
    });
  } catch (error: any) {
    console.error("Erreur détaillée:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        details: "Vérifie que ton token API est correct et que tu as des crédits"
      }, 
      { status: 500 }
    );
  }
}