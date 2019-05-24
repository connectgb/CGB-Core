import mongoose from 'mongoose';

export interface IUserState {
  userID: string;
  level: {
    current: number;
    xp: number;
  };
  wins: number;
  loses: number;
  coins: number;
  ingame: {
    isInGame: boolean;
    gameID: string;
  };
}
