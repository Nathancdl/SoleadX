import { NextResponse } from 'next/server';

// API temporaire sans Prisma pour tester l'interface
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password, username } = body;

    if (!email || !name || !password || !username) {
      return NextResponse.json(
        { message: 'Tous les champs sont obligatoires' },
        { status: 400 }
      );
    }

    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 500));

    // Réponse simulée
    return NextResponse.json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: 'user_' + Math.random().toString(36).substring(2, 15),
        name,
        email,
        username
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de l\'inscription' },
      { status: 500 }
    );
  }
} 