import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Tweet from '@/models/Tweet';
import User from '@/models/User';

// POST /api/tweets/[id]/retweet - Retweeter ou annuler un retweet
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
    
    // Vérifier si l'utilisateur a déjà retweeté ce tweet
    const isRetweeted = tweet.retweetedBy.includes(userId);
    
    if (isRetweeted) {
      // Annuler le retweet
      
      // 1. Retirer l'utilisateur de la liste des retweeters du tweet original
      await Tweet.findByIdAndUpdate(
        tweetId,
        { $pull: { retweetedBy: userId } }
      );
      
      // 2. Supprimer le retweet
      await Tweet.deleteOne({
        isRetweet: true,
        originalTweetId: tweetId,
        userId: userId
      });
      
      const updatedTweet = await Tweet.findById(tweetId)
        .populate('userId', 'name username image');
      
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
      
      return NextResponse.json({
        tweet: formattedTweet,
        action: 'unretweet'
      });
    } else {
      // Créer un retweet
      
      // 1. Ajouter l'utilisateur à la liste des retweeters du tweet original
      await Tweet.findByIdAndUpdate(
        tweetId,
        { $addToSet: { retweetedBy: userId } }
      );
      
      // 2. Créer un nouveau tweet qui est un retweet
      const newRetweet = await Tweet.create({
        content: tweet.content,
        userId: userId,
        likedBy: [],
        retweetedBy: [],
        isRetweet: true,
        originalTweetId: tweetId
      });
      
      // Récupérer les tweets mis à jour
      const [updatedOriginal, updatedRetweet] = await Promise.all([
        Tweet.findById(tweetId).populate('userId', 'name username image'),
        Tweet.findById(newRetweet._id).populate('userId', 'name username image')
      ]);
      
      // Transformer les tweets pour avoir le bon format
      const originalUser = (updatedOriginal as any).userId;
      const retweetUser = (updatedRetweet as any).userId;
      
      const formattedOriginal = {
        id: updatedOriginal._id,
        content: updatedOriginal.content,
        createdAt: updatedOriginal.createdAt,
        userId: originalUser._id,
        user: {
          name: originalUser.name,
          username: originalUser.username,
          image: originalUser.image
        },
        likes: updatedOriginal.likedBy.length,
        comments: 0, // À implémenter plus tard
        likedBy: updatedOriginal.likedBy,
        retweetedBy: updatedOriginal.retweetedBy,
        isRetweet: updatedOriginal.isRetweet,
        originalTweetId: updatedOriginal.originalTweetId
      };
      
      const formattedRetweet = {
        id: updatedRetweet._id,
        content: updatedRetweet.content,
        createdAt: updatedRetweet.createdAt,
        userId: retweetUser._id,
        user: {
          name: retweetUser.name,
          username: retweetUser.username,
          image: retweetUser.image
        },
        likes: 0,
        comments: 0,
        likedBy: [],
        retweetedBy: [],
        isRetweet: true,
        originalTweetId: tweetId
      };
      
      return NextResponse.json({
        tweet: formattedOriginal,
        retweet: formattedRetweet,
        action: 'retweet'
      });
    }
  } catch (error) {
    console.error('Erreur lors du retweet/annulation:', error);
    return NextResponse.json(
      { error: 'Erreur lors du retweet/annulation' },
      { status: 500 }
    );
  }
} 