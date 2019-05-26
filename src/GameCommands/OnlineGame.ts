import * as Discord from 'discord.js';
import mongoose from 'mongoose';
import { UserMD, IUserState } from '../Models/userState';

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
    // DB_CONNECTION: typeof mongoose
  ) {
    this.botClient = client;
    this.msg = message;
    this.args = cmdArguments;

    const hUser = message.guild.member(message.author);
    const cUser = message.guild.member(
      message.mentions.users.first() || message.guild.members.get(this.args[0])
    );
    switch (cUser) {
      // checks if player 2 is mentioned
      case null:
        message.reply('Tag another user use: connect4 <@user>');
        return;
      case hUser:
        message.reply('You Cant vs Yourself!');
        return;
    }
    // makes sure user mentioned is regestered in the db andplayer is not in a game
    //@ts-ignore
    UserMD.byUserIDnGuildID(
      `${this.cUser}`,
      this.msg.guild.id,
      (err: any, userData: IUserState) => {
        if (!userData) {
          this.msg.reply('The user you mentioned isnt in the DB');
          return;
        } else {
          switch (userData.ingame.isInGame) {
            case true:
              const theyAreAlreadyInAGameMSG = new Discord.RichEmbed()
                .setColor('#F44336')
                .setAuthor(`${this.cUser.user.tag}`)
                .setDescription(
                  `Player is already in a game, you can't challenge them to a game untill their current game is over`
                );
              this.msg.channel.send(theyAreAlreadyInAGameMSG);
              break;
            default:
          }
        }
      }
    );
  }
  // means that this function needs to be created in each child
  GameLifeCicle: Promise<void>;
}
