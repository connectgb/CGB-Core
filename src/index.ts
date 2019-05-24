import * as Discord from 'discord.js';
import { GameCommandsOBJ } from './GameCommands';
import { Database } from './Database';

const botPrefix = process.env.BOT_PREFIX;
const botToken = process.env.BOT_AUTHTOKEN;
const botClient = new Discord.Client();
const DB = new Database();

botClient.on('ready', () => {
  botClient.user.setActivity('Discord Mini Games');
  console.log(`${botClient.user.username} is online`);
});

botClient.on('message', receivedMessage => {
  if (receivedMessage.content.startsWith(botPrefix)) {
    // Prevent bot from responding to its own messages
    if (receivedMessage.author === botClient.user) {
      return;
    }
    let commands = receivedMessage.content.substr(botPrefix.length).split(' ');
    let primaryCmd = commands[0];
    let argsCmd = commands.slice(1);

    let gameCommandClass = GameCommandsOBJ[primaryCmd];
    gameCommandClass
      ? new gameCommandClass(botClient, receivedMessage, argsCmd)
      : noCommandsFound(receivedMessage, primaryCmd);
    //receivedMessage.delete();
  }
});

function noCommandsFound(Msg: Discord.Message, triedCmd: string) {
  const primaryCmdErrorMSG = new Discord.RichEmbed()
    .setColor('#F44336')
    .setDescription(`${Msg.author}`)
    .addField('Error:', `The command "${triedCmd}" does not exist!`);
  Msg.channel.send(primaryCmdErrorMSG);
}
botClient.login(botToken);
