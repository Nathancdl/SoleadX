import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Tweet from '@/models/Tweet';

// DELETE /api/tweets/[id] - Supprimer un tweet
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const tweetId = params.id;
    const body = await req.json();
    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      );
    }
    
    // Vérifier si le tweet existe
    const tweet = await Tweet.findById(tweetId);
    
    if (!tweet) {
      return NextResponse.json(
        { error: 'Tweet non trouvé' },
        { status: 404 }
      );
    }
    
    // Vérifier que l'utilisateur est le propriétaire du tweet
    if (tweet.userId.toString() !== userId) {
      return NextResponse.json(
        { error: 'Non autorisé à supprimer ce tweet' },
        { status: 403 }
      );
    }
    
    // Supprimer le tweet
    await Tweet.deleteOne({ _id: tweetId });
    
    // Supprimer également les retweets de ce tweet
    await Tweet.deleteMany({ originalTweetId: tweetId });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du tweet:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du tweet' },
      { status: 500 }
    );
  }
} 