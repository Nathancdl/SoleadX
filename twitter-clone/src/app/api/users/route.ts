import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { hash } from 'bcryptjs';

// GET /api/users - Récupérer tous les utilisateurs
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Récupérer les utilisateurs avec pagination
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    
    // Exclure le mot de passe des résultats
    const users = await User.find({}, { password: 0 })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalUsers = await User.countDocuments();
    
    return NextResponse.json({
      users,
      totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit)
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}

// POST /api/users - Créer un nouvel utilisateur
export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Route d\'inscription appelée');
    
    console.log('🔄 Connexion à la base de données...');
    await connectToDatabase();
    console.log('✅ Connexion à la BD réussie');
    
    const body = await req.json();
    console.log('📦 Données reçues:', JSON.stringify({...body, password: '***HIDDEN***'}));
    
    const { name, username, email, password, image } = body;
    
    // Vérifier si l'utilisateur existe déjà
    console.log('🔍 Vérification si l\'utilisateur existe déjà...');
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      console.log('⛔ Utilisateur existe déjà:', existingUser.email);
      return NextResponse.json(
        { error: 'Cet email ou nom d\'utilisateur existe déjà' },
        { status: 400 }
      );
    }
    
    // Hasher le mot de passe
    console.log('🔐 Hashage du mot de passe...');
    const hashedPassword = await hash(password, 10);
    
    // Créer le nouvel utilisateur
    console.log('👤 Création du nouvel utilisateur...');
    const newUser = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      image: image || `https://i.pravatar.cc/150?u=${email}`, // Avatar par défaut
      following: [],
      followers: []
    });
    
    console.log('✅ Utilisateur créé avec succès:', newUser._id);
    
    // Exclure le mot de passe de la réponse
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
      image: newUser.image,
      following: newUser.following,
      followers: newUser.followers,
      createdAt: newUser.createdAt
    };
    
    console.log('📤 Réponse envoyée');
    return NextResponse.json(userResponse, { status: 201 });
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    );
  }
} 