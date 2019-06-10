import * as Discord from 'discord.js';
import { OnlineGames } from '../../GameCommands/OnlineGame';
import { UserMD, IUserState } from '../../../Models/userState';

export default class LeaveGame {
  constructor(
    client: Discord.Client,
    message: Discord.Message,
    cmdArguments: Array<string>
  ) {
    //@ts-ignore
    UserMD.byUserID(message.author.id, function(
      err: any,
      userData: IUserState
    ) {
      const leftGameMSG = new Discord.RichEmbed()
        .setAuthor(message.author.username)
        .setColor('#008080')
        .addField('GameID', userData.ingame.gameID);
      if (userData.ingame.isInGame === true) {
        OnlineGames.updatePlayerStatusLeaveGame(
          message.author.id,
          message.guild.id
        );
        leftGameMSG.setDescription('You Left The Game!');
      } else {
        leftGameMSG.setDescription('Your not part of a game!');
      }
      message.channel.send(leftGameMSG);
    });
  }
}
