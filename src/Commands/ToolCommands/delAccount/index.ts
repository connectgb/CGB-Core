import * as Discord from 'discord.js';
import { OnlineGames } from '../../GameCommands/OnlineGame';
import {
  UserMD,
  IUserState,
  IUserAccountState,
} from '../../../Models/userState';

export default class LeaveGame {
  constructor(
    client: Discord.Client,
    message: Discord.Message,
    cmdArguments: Array<string>
  ) {
    //@ts-ignore
    UserMD.byUserID(message.author.id).then(async (userData: IUserState) => {
      // console.log(userData);
      const userAccountData: IUserAccountState = userData.serverAccounts.get(
        message.guild.id
      );
      const acceptEmoji = `🔵`;
      const ConfirmationMSG = new Discord.RichEmbed()
        .setAuthor(message.author.username)
        .setColor('#F44336')
        .setDescription('Are You Sure You Want To Delete This Account?')
        .addField('Level', userAccountData.level.current)
        .addField('Experience', userAccountData.level.xp)
        .addField('Coins', userAccountData.coins)
        .addField('Wins', userAccountData.playerStat.wins)
        .addField('Loses', userAccountData.playerStat.loses)
        .addField('Current Streak', userAccountData.playerStat.streak)
        .addField('Joined data', userAccountData.playerStat.joinedDate)
        .setFooter(`please confirm this action by adding ${acceptEmoji}`);

      let ConfirmationMSGSent = (await message.channel.send(
        ConfirmationMSG
      )) as Discord.Message;

      await this.deleteAccountConformation(message, ConfirmationMSGSent);
      await ConfirmationMSGSent.delete();
    });
  }
  async deleteAccountConformation(
    message: Discord.Message,
    sentConfMSG: Discord.Message
  ) {
    const acceptEmoji = `🔵`,
      rejectEmoji = `🔴`;
    // waits for the reactions to be added
    await Promise.all([
      sentConfMSG.react(acceptEmoji),
      sentConfMSG.react(rejectEmoji),
    ]);

    const filter = (
      reaction: Discord.MessageReaction,
      user: Discord.GuildMember
    ) => {
      if (
        user.id === message.author.id &&
        (reaction.emoji.name === acceptEmoji ||
          reaction.emoji.name === rejectEmoji)
      ) {
        return true;
      }

      return false;
    };

    await sentConfMSG
      .awaitReactions(
        filter,
        { max: 1, time: 6000 } // waits for 6ms => 6 seconds
      )
      .then(reactionResults => {
        // console.log(reactionResults.get(acceptEmoji));
        if (
          reactionResults.get(acceptEmoji) == null ||
          reactionResults.get(acceptEmoji).count - 1 !== 1
        ) {
          message.channel.send('Aborted!');
        } else {
          message.channel.send('Confirmed!');
          UserMD.findOneAndUpdate(
            {
              userID: message.author.id,
            },
            {
              $unset: { ['serverAccounts.' + message.guild.id]: {} },
            }
          ).then(next => {
            message.channel.send('Account Deleted');
          });
        }
      })
      .catch((e: any) => {
        console.log('ERROR: listening to players accept/reject reaction');
        console.log(e);
      });
  }
}
