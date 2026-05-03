"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Crown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface SubscriptionButtonProps {
  userId: string;
}

export function SubscriptionButton({ userId }: SubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!userId) {
      toast.error("Vous devez être connecté");
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      
      const { url, error } = await response.json();
      
      if (error) throw new Error(error);
      
      // Rediriger vers Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors du paiement");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button
      onClick={handleSubscribe}
      disabled={loading}
      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Crown className="w-4 h-4 mr-2" />
      )}
      {loading ? "Préparation..." : "Devenir Premium (9.99€/mois)"}
    </Button>
  );
}