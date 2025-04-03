import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Tweet from '@/models/Tweet';
import User from '@/models/User';

// GET /api/tweets - Récupérer tous les tweets
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Récupérer les tweets avec pagination
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const username = searchParams.get('username') || '';
    const skip = (page - 1) * limit;
    
    // Construire la requête
    let query = {};
    
    // Si un nom d'utilisateur est spécifié, filtrer par utilisateur
    if (username) {
      const user = await User.findOne({ username });
      if (user) {
        query = { userId: user._id };
      }
    }
    
    // Récupérer les tweets et les informations utilisateur
    const tweets = await Tweet.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name username image');
    
    // Transformer les tweets pour avoir le bon format
    const formattedTweets = tweets.map(tweet => {
      const user = tweet.userId as any;
      return {
        id: tweet._id,
        content: tweet.content,
        createdAt: tweet.createdAt,
        userId: user._id,
        user: {
          name: user.name,
          username: user.username,
          image: user.image
        },
        likes: tweet.likedBy.length,
        comments: 0, // À implémenter plus tard
        likedBy: tweet.likedBy,
        retweetedBy: tweet.retweetedBy,
        isRetweet: tweet.isRetweet,
        originalTweetId: tweet.originalTweetId
      };
    });
    
    const totalTweets = await Tweet.countDocuments(query);
    
    return NextResponse.json({
      tweets: formattedTweets,
      totalTweets,
      currentPage: page,
      totalPages: Math.ceil(totalTweets / limit)
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des tweets:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des tweets' },
      { status: 500 }
    );
  }
}

// POST /api/tweets - Créer un nouveau tweet
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { content, userId } = body;
    
    if (!content || !userId) {
      return NextResponse.json(
        { error: 'Contenu et ID utilisateur requis' },
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
    
    // Créer le nouveau tweet
    const newTweet = await Tweet.create({
      content,
      userId,
      likedBy: [],
      retweetedBy: [],
      isRetweet: false
    });
    
    // Récupérer le tweet avec les informations utilisateur
    const populatedTweet = await Tweet.findById(newTweet._id)
      .populate('userId', 'name username image');
    
    // Transformer le tweet pour avoir le bon format
    const tweet = populatedTweet as any;
    const formattedTweet = {
      id: tweet._id,
      content: tweet.content,
      createdAt: tweet.createdAt,
      userId: user._id,
      user: {
        name: user.name,
        username: user.username,
        image: user.image
      },
      likes: 0,
      comments: 0,
      likedBy: [],
      retweetedBy: [],
      isRetweet: false
    };
    
    return NextResponse.json(formattedTweet, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du tweet:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du tweet' },
      { status: 500 }
    );
  }
} 