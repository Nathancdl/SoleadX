import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Tweet from '@/models/Tweet';
import User from '@/models/User';

// POST /api/tweets/[id]/like - Liker ou unliker un tweet
export async function POST(
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
    
    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
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
    
    // Vérifier si l'utilisateur a déjà liké ce tweet
    const isLiked = tweet.likedBy.includes(userId);
    
    let updatedTweet;
    
    if (isLiked) {
      // Unliker
      updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { $pull: { likedBy: userId } },
        { new: true }
      ).populate('userId', 'name username image');
    } else {
      // Liker
      updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { $addToSet: { likedBy: userId } },
        { new: true }
      ).populate('userId', 'name username image');
    }
    
    // Transformer le tweet pour avoir le bon format
    const userObj = (updatedTweet as any).userId;
    const formattedTweet = {
      id: updatedTweet._id,
      content: updatedTweet.content,
      createdAt: updatedTweet.createdAt,
      userId: userObj._id,
      user: {
        name: userObj.name,
        username: userObj.username,
        image: userObj.image
      },
      likes: updatedTweet.likedBy.length,
      comments: 0, // À implémenter plus tard
      likedBy: updatedTweet.likedBy,
      retweetedBy: updatedTweet.retweetedBy,
      isRetweet: updatedTweet.isRetweet,
      originalTweetId: updatedTweet.originalTweetId
    };
    
    return NextResponse.json(formattedTweet);
  } catch (error) {
    console.error('Erreur lors du like/unlike du tweet:', error);
    return NextResponse.json(
      { error: 'Erreur lors du like/unlike du tweet' },
      { status: 500 }
    );
  }
} 