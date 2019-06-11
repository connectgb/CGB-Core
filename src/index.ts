import * as Discord from 'discord.js';
import { GameCommandsOBJ } from './Commands';
import { Database } from './Database';
import { UserMD, IUserState } from './Models/userState';

const botClient = new Discord.Client();
const DB = new Database();

botClient.on('ready', () => {
  botClient.user.setActivity('Discord Mini Games');
  console.log(`${botClient.user.username} is online`);
});

botClient.on('message', receivedMessage => {
  if (receivedMessage.content.startsWith(process.env.BOT_PREFIX)) {
    // Prevent bot from responding to its own messages
    if (receivedMessage.author === botClient.user) {
      return;
    }
    // check if users info is in the DB else create it
    //@ts-ignore
    UserMD.byUserID(
      receivedMessage.author.id,
      (err: any, userData: IUserState) => {
        if (!userData) {
          createNewUserProfile(
            receivedMessage.author,
            receivedMessage.channel,
            receivedMessage.guild.id
          );

          return true;
        } else if (
          userData.serverAccounts.get(receivedMessage.guild.id) === undefined
        ) {
          createNewAccount(
            userData,
            receivedMessage.author,
            receivedMessage.channel,
            receivedMessage.guild.id
          );
        } else {
          let commands = receivedMessage.content
            .substr(process.env.BOT_PREFIX.length)
            .split(' ');
          let primaryCmd = commands[0];
          let argsCmd = commands.slice(1);
          switch (userData.ingame.isInGame && primaryCmd !== '!leaveGame') {
            case true:
              const youAreAlreadyInAGameMSG = new Discord.RichEmbed()
                .setColor('#F44336')
                .setAuthor(`${receivedMessage.author.tag}`)
                .setDescription(
                  `You are already in a game, you cant run any other commands untill your current game is over`
                )
                .addField('solution:', `Run ~!leaveGame to forfit the game`);
              receivedMessage.channel.send(youAreAlreadyInAGameMSG);
              break;
            default:
              // parsing the command sent to the bot to main command and arguments

              let gameCommandClass = GameCommandsOBJ[primaryCmd];
              gameCommandClass
                ? new gameCommandClass(botClient, receivedMessage, argsCmd)
                : noCommandsFound(receivedMessage, primaryCmd);
              //receivedMessage.delete();

              break;
          }
        }
      }
    );
  }
});

function noCommandsFound(Msg: Discord.Message, triedCmd: string) {
  const primaryCmdErrorMSG = new Discord.RichEmbed()
    .setColor('#F44336')
    .setDescription(`${Msg.author}`)
    .addField('Error:', `The command "${triedCmd}" does not exist!`);
  Msg.channel.send(primaryCmdErrorMSG);
}
async function createNewAccount(
  userData: IUserState,
  userDiscordInfo: Discord.User,
  discordChannel:
    | Discord.TextChannel
    | Discord.DMChannel
    | Discord.GroupDMChannel,
  guildID: string
) {
  if (userData._sub.ConnectedLevel > 0 || userData.serverAccounts.size === 0) {
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
        'Become a Patron: https://www.patreon.com/ConnectGames '
      )
      .addField(
        'solution 2',
        '~!delAccount - This will delete the account thatthe current server is using (if any)'
      )
      .setFooter(
        'For more features and exclusive bonuses become a patron!: https://www.patreon.com/ConnectGames '
      );
    discordChannel.send(newAccountmemberFailedNotAPrtron);
  }
}
async function createNewUserProfile(
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
botClient.login(process.env.BOT_AUTHTOKEN);
