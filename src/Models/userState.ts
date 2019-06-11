import { Schema, model, Model, Document } from 'mongoose';

const userServerDataSchema = new Schema({
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
});
const userSchema = new Schema({
  userID: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  _sub: {
    ConnectedLevel: { type: Number, default: 0 },
    expireDate: { type: Date, default: null },
    accountsLimmit: { type: Number, default: 1 },
  },
  serverAccounts: { type: Map, of: userServerDataSchema },
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

export interface IUserAccountState {
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
  guildID: string;
}
export interface IUserState {
  userID: string;
  _sub: {
    ConnectedLevel: Number;
    expireDate: Date;
    accountsLimmit: Number;
  };
  serverAccounts: Map<string, IUserAccountState>;
  ingame: {
    gameID: string;
    isInGame: boolean;
    lastGame: Date;
  };
}
interface IUserStateDoc extends Document, IUserState {}

// all instances will have acces to this when doing UserMD.findOne().byUserID('usersID')
userSchema.statics.byUserID = function(userID: string, cb: void) {
  return this.findOne({ userID }, cb);
};

export const UserMD: Model<IUserStateDoc> = model('User', userSchema, 'Users');
