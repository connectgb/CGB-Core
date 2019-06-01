import * as Discord from 'discord.js';
import { Schema, model, Document, Model } from 'mongoose';
import { userDiscordSchema } from './userState';

const GameMetaInfoSchema = new Schema(
  {
    title: { type: String, required: true },
    numPlayers: { type: Number, required: true, min: 1, max: 4 },
    imageUrl: { type: String, required: false },
    description: { type: String, required: false, lowercase: true },
  },
  { _id: false }
);
const GameMetaDataSchema = new Schema(
  {
    guildID: { type: String, required: true },
    gameID: { type: String, required: true, unique: true, index: true },
    status: { type: String, required: true, default: 'ACCEPTED' },
    accepted: { type: Boolean, required: true, default: true },
    // players: { type: userDiscordSchema, required: true },
    playerIDs: { type: [String], required: true },
    channelID: { type: String, required: true },
    metaInfo: { type: GameMetaInfoSchema, required: true },
  },
  { _id: false }
);
const GameSchema = new Schema({
  meta: GameMetaDataSchema,
  env: {
    onGoing: { type: Boolean, default: true },
    playerTurn: { type: Number, default: 1 },
  },
  props: { type: Map, of: Schema.Types.Mixed, required: true },
});

export interface IGameMetaInfo {
  title: string;
  numPlayers?: number;
  imageUrl: string;
  description?: string;
}

export interface IGameMetaData {
  guildID: string;
  gameID: string;
  status: 'REJECTED' | 'ACCEPTED';
  accepted: boolean;
  players?: Array<Discord.User>;
  playerIDs: Array<String>;
  channelID: string;
  metaInfo: IGameMetaInfo;
  // gameData:IGameData
}

export interface IGameData {
  meta: IGameMetaData;
  env: {
    onGoing: Boolean;
    playerTurn: number;
  };
  props: any;
}
interface IGameDataDoc extends Document, IGameData {}

GameSchema.statics.byGameID = function(gameID: string, cb: void) {
  return this.findOne({ 'meta.gameID': gameID }, cb);
};

export const GameMD: Model<IGameDataDoc> = model('Game', GameSchema, 'Games');
