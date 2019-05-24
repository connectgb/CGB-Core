import { OnlineGames } from '../OnlineGame';

import * as Discord from 'discord.js';

export default class Connect4 extends OnlineGames {
	constructor(
		client: Discord.Client,
		message: Discord.Message,
		cmdArguments: Array<string>
	) {
		super(client, message, cmdArguments);
	}
}
