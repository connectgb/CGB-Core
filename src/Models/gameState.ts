import * as Discord from 'discord.js';

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
  players: Array<Discord.User>;
  playerIDs: Array<String>;
  channelID: string;
  metaInfo: IGameMetaInfo;
}
