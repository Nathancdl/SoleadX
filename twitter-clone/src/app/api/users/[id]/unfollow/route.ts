import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

// POST /api/users/[id]/unfollow - Ne plus suivre un utilisateur
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const userToUnfollowId = params.id;
    const body = await req.json();
    const { followerId } = body;
    
    if (!followerId) {
      return NextResponse.json(
        { error: 'ID du suiveur requis' },
        { status: 400 }
      );
    }
    
    // Vérifier si les deux utilisateurs existent
    const [follower, userToUnfollow] = await Promise.all([
      User.findById(followerId),
      User.findById(userToUnfollowId)
    ]);
    
    if (!follower || !userToUnfollow) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier si l'utilisateur suit déjà l'autre utilisateur
    if (!follower.following?.includes(userToUnfollowId)) {
      return NextResponse.json(
        { error: 'Vous ne suivez pas cet utilisateur' },
        { status: 400 }
      );
    }
    
    // Mettre à jour les deux utilisateurs
    const [updatedFollower, updatedFollowed] = await Promise.all([
      User.findByIdAndUpdate(
        followerId,
        { $pull: { following: userToUnfollowId } },
        { new: true, select: '-password' }
      ),
      User.findByIdAndUpdate(
        userToUnfollowId,
        { $pull: { followers: followerId } },
        { new: true, select: '-password' }
      )
    ]);
    
    return NextResponse.json({
      follower: updatedFollower,
      followed: updatedFollowed
    });
  } catch (error) {
    console.error('Erreur lors du désabonnement:', error);
    return NextResponse.json(
      { error: 'Erreur lors du désabonnement' },
      { status: 500 }
    );
  }
} 