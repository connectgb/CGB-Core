import * as Discord from 'discord.js';
import { GameCommandsOBJ } from './GameCommands';
const botPrefix = process.env.BOT_PREFIX;
const botToken = process.env.BOT_AUTHTOKEN;
const botClient = new Discord.Client();

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

		let gameCommandFile = GameCommandsOBJ[primaryCmd];
		gameCommandFile
			? gameCommandFile.run(botClient, receivedMessage, argsCmd)
			: noCommandsFound(receivedMessage);
		//receivedMessage.delete();
	}
});

function noCommandsFound(Msg: Discord.Message) {
	Msg.reply('Command does not exist.');
}
botClient.login(botToken);
