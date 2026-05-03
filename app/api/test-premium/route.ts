import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    
    // Mettre à jour le profil pour le passer en Premium
    const { error } = await supabase
      .from('profiles')
      .update({ 
        subscription_tier: 'premium', 
        credits: 999999 
      })
      .eq('id', user.id)
    
    if (error) {
      console.error('Erreur update:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, message: 'Mode Premium activé (simulation)' })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}