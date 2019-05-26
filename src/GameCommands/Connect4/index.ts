import * as Discord from 'discord.js';
import mongoose from 'mongoose';
import { OnlineGames } from '../OnlineGame';

export default class Connect4 extends OnlineGames {
  constructor(
    client: Discord.Client,
    message: Discord.Message,
    cmdArguments: Array<string>
  ) {
    super(client, message, cmdArguments);
  }
}
