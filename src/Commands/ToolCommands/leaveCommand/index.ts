import * as Discord from 'discord.js';
import { OnlineGames } from '../../GameCommands/OnlineGame';
import { UserMD, IUserState } from '../../../Models/userState';
import { DiscordCommand } from '../../DiscordCommand';

export default class LeaveGameCommand extends DiscordCommand {
    userData: IUserState;
  constructor(
    client: Discord.Client,
    message: Discord.Message,
    cmdArguments: Array<string>
  ) {
    super(client, message, cmdArguments);
    //@ts-ignore
    UserMD.byUserID(message.author.id, (
      err: any,
      userData: IUserState
    ) => {
        
        this.userData = userData;
        switch (cmdArguments[0]) {
            case 'game':
              this.leaveGame()
              break;
            default:
          this.leaveGame()
          break
      }
      
    });
  }
  leaveGame() {
      const leftGameMSG = new Discord.RichEmbed()
        .setAuthor(this.msg.author.username)
        .setColor('#008080')
        .addField('GameID', this.userData.ingame.gameID);
      if (this.userData.ingame.isInGame === true) {
        OnlineGames.updatePlayerStatusLeaveGame(this.msg.author.id);
        leftGameMSG.setDescription('You Left The Game!');
      } else {
        leftGameMSG.setDescription('Your not part of a game!');
      }
      this.msg.channel.send(leftGameMSG);
      
  }
}
