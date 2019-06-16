import * as Discord from 'discord.js';

export abstract class DiscordCommand {
  botClient: Discord.Client;
  msg: Discord.Message;
  args: Array<string>;
  constructor(
    client: Discord.Client,
    message: Discord.Message,
    cmdArguments: Array<string>
  ) {
    // init variables
    this.botClient = client;
    this.msg = message;
    this.args = cmdArguments;
  }
}
