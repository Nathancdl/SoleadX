import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

export interface ITweet extends Document {
  content: string;
  userId: mongoose.Types.ObjectId | string;
  likedBy: (mongoose.Types.ObjectId | string)[];
  retweetedBy: (mongoose.Types.ObjectId | string)[];
  isRetweet: boolean;
  originalTweetId?: mongoose.Types.ObjectId | string;
  createdAt: Date;
}

const TweetSchema: Schema = new Schema({
  content: { type: String, required: true, maxlength: 280 },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  retweetedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isRetweet: { type: Boolean, default: false },
  originalTweetId: { type: Schema.Types.ObjectId, ref: 'Tweet' },
  createdAt: { type: Date, default: Date.now }
});

// Méthode virtuelle pour compter les likes
TweetSchema.virtual('likes').get(function(this: ITweet) {
  return this.likedBy.length;
});

// Méthode virtuelle pour compter les retweets
TweetSchema.virtual('retweets').get(function(this: ITweet) {
  return this.retweetedBy.length;
});

// Assurer que les virtuals sont inclus lors de la conversion en JSON
TweetSchema.set('toJSON', { virtuals: true });
TweetSchema.set('toObject', { virtuals: true });

// Vérifier si le modèle Tweet existe déjà pour éviter les erreurs de redéfinition
export default mongoose.models.Tweet || mongoose.model<ITweet>('Tweet', TweetSchema); 