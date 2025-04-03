import mongoose from 'mongoose';

// Définir l'interface de cache pour la connexion
interface ConnectionCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Variable globale pour stocker la connexion entre les appels
let cached: ConnectionCache = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  // Si la connexion existe déjà, la retourner
  if (cached.conn) {
    console.log('✅ Utilisation d\'une connexion MongoDB existante');
    return cached.conn;
  }

  // Définir l'URI de connexion (à remplacer par votre propre URI MongoDB)
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/twitter-clone';
  console.log('🔄 Tentative de connexion à MongoDB:', MONGODB_URI.replace(/mongodb:\/\/([^:]+):([^@]+)@/, 'mongodb://***:***@'));

  // Si aucune promesse de connexion n'existe encore, en créer une
  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Connexion MongoDB établie avec succès');
      return mongoose;
    });
  } else {
    console.log('🔄 Utilisation d\'une promesse de connexion existante');
  }

  // Attendre la résolution de la promesse et mettre en cache la connexion
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    console.error('❌ Erreur de connexion MongoDB:', e);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
} 