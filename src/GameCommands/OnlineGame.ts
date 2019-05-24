import * as Discord from 'discord.js';

export class OnlineGames {
  botClient: Discord.Client;
  msg: Discord.Message;
  args: Array<string>;
  hUser: Discord.GuildMember;
  cUser: Discord.GuildMember;
  constructor(
    client: Discord.Client,
    message: Discord.Message,
    cmdArguments: Array<string>
  ) {
    this.botClient = client;
    this.msg = message;
    this.args = cmdArguments;

    const hUser = message.guild.member(message.author);
    const cUser = message.guild.member(
      message.mentions.users.first() || message.guild.members.get(this.args[0])
    );
    if (!cUser) {
      // checks if player 2 is mentioned
      message.reply('Tag another user use: connect4 <@user>');
      return;
    }

    // makes sure both users are regestered in the db and are not in a game
  }

  // means that this function needs to be created in each child
  GameLifeCicle: Promise<void>;
}
