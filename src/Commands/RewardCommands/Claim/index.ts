import * as Discord from 'discord.js';
import { OnlineGames } from '../../GameCommands/OnlineGame';
import { UserMD, IUserState } from '../../../Models/userState';
import { DiscordCommand } from '../../DiscordCommand';

export default class ClaimPatreonRewards extends DiscordCommand {
  userData: IUserState;
  UserStatusTags: Discord.Collection<string, Discord.Role>;
  constructor(
    client: Discord.Client,
    message: Discord.Message,
    cmdArguments: Array<string>
  ) {
    super(client, message, cmdArguments);
    if (message.guild.id !== '566982444822036500') {
      message.reply(
        'you need to execute all claim commands in the official server. code: qcrVRSF'
      );
      return;
    }
    //@ts-ignore
    UserMD.byUserID(message.author.id).then(async (userData: IUserState) => {
      // console.log(userData);
      this.userData = userData;
      this.UserStatusTags = message.member.roles;
      switch (cmdArguments[0]) {
        case 'perks':
          this.claimPerks(message);
          break;
        default:
          this.claimPerks(message);
          break;
      }
      // console.log(UserStatusTags);
    });
  }

  async claimPerks(message: Discord.Message) {
    const userAccountData = this.userData.serverAccounts.get(message.guild.id);
    if (this.userData._sub.ConnectedLevel > 0) {
      message.reply(
        `you already have a level ${
          this.userData._sub.ConnectedLevel
        } connection subscription activated`
      );
      return;
    }
    let highestConnectionLevel = 0;
    this.UserStatusTags.forEach(role => {
      switch (role.name) {
        case 'Starter':
          highestConnectionLevel =
            highestConnectionLevel < 1 ? 1 : highestConnectionLevel;
          break;
        case 'Linked':
          highestConnectionLevel =
            highestConnectionLevel < 2 ? 2 : highestConnectionLevel;
          break;
        case 'Plug':
          highestConnectionLevel =
            highestConnectionLevel < 3 ? 3 : highestConnectionLevel;
          break;
        case 'Provider':
          highestConnectionLevel =
            highestConnectionLevel < 4 ? 4 : highestConnectionLevel;
          break;
        default:
          message.reply(
            'You must of connect connected your patreon account with your discord'
          );
          break;
      }
    });
    await UserMD.findOneAndUpdate(
      {
        userID: message.author.id,
      },
      {
        '_sub.ConnectedLevel': highestConnectionLevel,
        '_sub.expireDate': new Date(
          new Date().setMonth(new Date().getMonth() + (1 % 12)) // plus one month
        ),
        '_sub.accountsLimmit': 10 * highestConnectionLevel,
      }
    ).then(data =>
      message.reply(`You Now have level ${highestConnectionLevel} connection!`)
    );
  }
}
