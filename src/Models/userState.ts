import { Schema, model, Model, Document } from 'mongoose';

const userSchema = new Schema({
  userID: { type: String, unique: true, required: true, index: true },
  guildID: { type: String, required: true, index: true },
  playerStat: {
    wins: { type: Number, default: 0 },
    loses: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    joinedDate: { type: Date, default: Date.now },
  },
  coins: { type: Number, default: 300 },
  level: {
    current: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
  },
  ingame: {
    gameID: { type: Schema.Types.ObjectId, ref: 'Game', default: null },
    isInGame: { type: Boolean, default: false },
    lastGame: { type: Date, default: null },
  },
});

export const userDiscordSchema = new Schema(
  {
    id: { type: String, required: true },
    username: { type: String, required: true },
    discriminator: { type: String, required: true },
    avatar: { type: String, required: true },
    lastMessageID: { type: String, default: null },
  },
  { _id: false }
);

export interface IUserState {
  userID: string;
  level: {
    current: number;
    xp: number;
  };
  playerStat: {
    wins: number;
    loses: number;
    streak: number;
    joinedDate: Date;
  };
  coins: number;
  ingame: {
    gameID: string;
    isInGame: boolean;
    lastGame: Date;
  };
}
interface IUserStateDoc extends Document, IUserState {}

// all instances will have acces to this when doing UserMD.findOne().byUserID('usersID')
userSchema.statics.byUserIDnGuildID = function(
  userID: string,
  guildID: string,
  cb: void
) {
  return this.findOne({ userID, guildID }, cb);
};

export const UserMD: Model<IUserStateDoc> = model('User', userSchema, 'Users');
