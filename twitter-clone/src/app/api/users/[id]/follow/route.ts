import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

// POST /api/users/[id]/follow - Suivre un utilisateur
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const userToFollowId = params.id;
    const body = await req.json();
    const { followerId } = body;
    
    if (!followerId) {
      return NextResponse.json(
        { error: 'ID du suiveur requis' },
        { status: 400 }
      );
    }
    
    // Vérifier si les deux utilisateurs existent
    const [follower, userToFollow] = await Promise.all([
      User.findById(followerId),
      User.findById(userToFollowId)
    ]);
    
    if (!follower || !userToFollow) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier si l'utilisateur essaie de se suivre lui-même
    if (followerId === userToFollowId) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas vous suivre vous-même' },
        { status: 400 }
      );
    }
    
    // Vérifier si l'utilisateur suit déjà l'autre utilisateur
    if (follower.following?.includes(userToFollowId)) {
      return NextResponse.json(
        { error: 'Vous suivez déjà cet utilisateur' },
        { status: 400 }
      );
    }
    
    // Mettre à jour les deux utilisateurs
    const [updatedFollower, updatedFollowed] = await Promise.all([
      User.findByIdAndUpdate(
        followerId,
        { $addToSet: { following: userToFollowId } },
        { new: true, select: '-password' }
      ),
      User.findByIdAndUpdate(
        userToFollowId,
        { $addToSet: { followers: followerId } },
        { new: true, select: '-password' }
      )
    ]);
    
    return NextResponse.json({
      follower: updatedFollower,
      followed: updatedFollowed
    });
  } catch (error) {
    console.error('Erreur lors du suivi de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors du suivi de l\'utilisateur' },
      { status: 500 }
    );
  }
} 