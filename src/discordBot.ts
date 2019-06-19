import * as Discord from 'discord.js';
import { GameCommandsOBJ } from './Commands';
import { UserMD, IUserState } from './Models/userState';

export class DiscordBotRun {
  mainGuildData = {
    id: '566982444822036500',
    patronReward: {
      channel: '588462707594887185',
      message: '589435499496603648',
    },
  };
  botClient: Discord.Client;

  constructor() {
    this.botClient = new Discord.Client();
    this.botClient.login(process.env.BOT_AUTHTOKEN);

    this.botClient.on('ready', () => {
      this.botClient.user.setActivity('Discord Mini Games | ~help ');
      console.log(`${this.botClient.user.username} is online`);
    });

    this.BotOnlineListen();
  }

  BotOnlineListen() {
    this.botClient.on('message', receivedMessage => {
      // console.log(receivedMessage);
      if (!receivedMessage.content.startsWith(process.env.BOT_PREFIX)) {
        return;
      }
      // Prevent bot from responding to its own messages
      if (receivedMessage.author === this.botClient.user) {
        return;
      }
      // check if users info is in the DB else create it
      //@ts-ignore
      UserMD.byUserID(
        receivedMessage.author.id,
        (err: any, userData: IUserState) => {
          if (!userData) {
            this.createNewUserProfile(
              receivedMessage.author,
              receivedMessage.channel,
              receivedMessage.guild.id
            );

            return true;
          } else if (
            userData.serverAccounts.get(receivedMessage.guild.id) === undefined
          ) {
            this.createNewAccount(
              userData,
              receivedMessage.author,
              receivedMessage.channel,
              receivedMessage.guild.id
            );
          } else {
            let commands = receivedMessage.content
              .toLowerCase()
              .substr(process.env.BOT_PREFIX.length)
              .split(' ');
            let primaryCmd = commands[0];
            let argsCmd = commands.slice(1);
            switch (userData.ingame.isInGame && primaryCmd !== '!leave') {
              case true:
                const youAreAlreadyInAGameMSG = new Discord.RichEmbed()
                  .setColor('#F44336')
                  .setAuthor(`${receivedMessage.author.tag}`)
                  .setDescription(
                    `You are already in a game, you cant run any other commands untill your current game is over`
                  )
                  .addField('solution:', `Run ~!leave game (to for-fit the game)`);
                receivedMessage.channel.send(youAreAlreadyInAGameMSG);
                break;
              default:
                // parsing the command sent to the bot to main command and arguments
                let gameCommandClass = GameCommandsOBJ[primaryCmd];

                if (!gameCommandClass) {
                  this.noCommandsFound(receivedMessage, primaryCmd);
                } else if (
                  gameCommandClass.isPrime! &&
                  userData._sub.ConnectedLevel < 2
                ) {
                  // prime commands need connection level greater than 2
                } else if (gameCommandClass.execute !== undefined) {
                  new gameCommandClass.execute(
                    this.botClient,
                    receivedMessage,
                    argsCmd
                  );
                }
                //receivedMessage.delete();

                break;
            }
          }
        }
      );
    });
  }

  noCommandsFound(Msg: Discord.Message, triedCmd: string) {
    const primaryCmdErrorMSG = new Discord.RichEmbed()
      .setColor('#F44336')
      .setDescription(`${Msg.author}`)
      .addField('Error:', `The command "${triedCmd}" does not exist!`);
    Msg.channel.send(primaryCmdErrorMSG);
  }
  async createNewAccount(
    userData: IUserState,
    userDiscordInfo: Discord.User,
    discordChannel:
      | Discord.TextChannel
      | Discord.DMChannel
      | Discord.GroupDMChannel,
    guildID: string
  ) {
    if (
      (userData._sub.ConnectedLevel > 0 &&
        userData._sub.accountsLimit > userData.serverAccounts.size) ||
      userData.serverAccounts.size === 0 || guildID == this.mainGuildData.id
    ) {
      UserMD.findOneAndUpdate(
        { userID: userDiscordInfo.id },
        {
          $set: {
            ['serverAccounts.' + guildID]: { guildID },
          },
        }
      )
        .exec()
        .then(next => {
          const newAccountMember = new Discord.RichEmbed()
            .setColor('#60BE82')
            .setAuthor(`${userDiscordInfo.tag}`)
            .setTitle('New Account Created!')
            .setDescription(
              'You are now part of the system. Now you have access to games on this server! Have Fun Winning!'
            );
          discordChannel.send(newAccountMember);
        });
    } else {
      const newAccountmemberFailedNotAPrtron = new Discord.RichEmbed()
        .setColor('#F44336')
        .setAuthor(`${userDiscordInfo.tag}`)
        .setTitle('New Account?')
        .setDescription(
          'It looks like you want to create another account on another server. You have no subscriptions to allow you to do this!'
        )
        .addField(
          'solution 1 (recommended)',
          'Become a Patron: https://www.patreon.com/ConnectGames then use the ~claim perks command to activate your perks!'
        )
        .addField(
          'solution 2',
          '~!delete account - This will delete the account that the current server is using (if any)'
        )
        .setFooter(
          'For more features and exclusive bonuses become a patron!: https://www.patreon.com/ConnectGames '
        );
      discordChannel.send(newAccountmemberFailedNotAPrtron);
    }
  }
  async createNewUserProfile(
    userDiscordInfo: Discord.User,
    discordChannel:
      | Discord.TextChannel
      | Discord.DMChannel
      | Discord.GroupDMChannel,
    guildID: string
  ) {
    // console.log('user not found in DB');
    const newUser = new UserMD({
      userID: userDiscordInfo.id,
      serverAccounts: {
        [guildID]: { guildID },
      },
    });
    newUser
      .save()
      .then(data => {
        // new user created success message
        const successfulNewAccountMSG = new Discord.RichEmbed()
          .setColor('#60BE82')
          .setAuthor(`${userDiscordInfo.tag}`)
          .setTitle('New Account Created!')
          .setDescription(
            'You are now part of the system. Now you have access to games on this server! Have Fun Winning!'
          )
          .setFooter(
            'For more features and exclusive bonuses become a patron!: https://www.patreon.com/ConnectGames '
          );
        discordChannel.send(successfulNewAccountMSG);
      })
      .catch(e => {
        // new user created fail message
        const FailedNewUserMSG = new Discord.RichEmbed()
          .setTitle('New User Error!')
          .setColor('#F44336')
          .setAuthor(`${userDiscordInfo.tag}`)
          .setDescription(
            `There was an error creating ${userDiscordInfo} account on the server`
          );
        discordChannel.send(FailedNewUserMSG);
        console.log(e);
      });
  }
}
