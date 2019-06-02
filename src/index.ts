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
    UserMD.byUserIDnGuildID(
      receivedMessage.author.id,
      receivedMessage.guild.id,
      (err: any, userData: IUserState) => {
        if (!userData) {
          createNewUserProfile(
            receivedMessage.author,
            receivedMessage.channel,
            receivedMessage.guild.id
          );
          return true;
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
async function createNewUserProfile(
  userDiscordInfo: Discord.User,
  discordChannel:
    | Discord.TextChannel
    | Discord.DMChannel
    | Discord.GroupDMChannel,
  guildID: string
) {
  // console.log('user not found in DB');
  const newUser = new UserMD({ userID: userDiscordInfo.id, guildID });
  newUser
    .save()
    .then(data => {
      // new user created success message
      const successfulNewAccountMSG = new Discord.RichEmbed()
        .setColor('#60BE824')
        .setAuthor(`${userDiscordInfo.tag}`)
        .setTitle('New Account Created!')
        .setDescription(
          'You are now part of the system. Now you have full access to all the games on the platform! Have Fun Winning!'
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
