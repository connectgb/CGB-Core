import * as Discord from 'discord.js';

import { GameCommandsOBJ } from '../../';
import { DiscordCommand } from '../../DiscordCommand';

export default class HelpCommand extends DiscordCommand {
  constructor(
    client: Discord.Client,
    message: Discord.Message,
    cmdArguments: Array<string>
  ) {
    super(client, message, cmdArguments);
    const helpMessage = new Discord.RichEmbed()
      .setColor('#D3D3D3')
      .setTitle('Help Command');
    if (this.args[0] !== undefined) {
      const commandMeta = GameCommandsOBJ[this.args[0]];
      if (commandMeta) {
        helpMessage
          .addField(
            `${commandMeta.name} ${commandMeta.isPrime ? '(Prime)' : ''}`,
            commandMeta.params,
            true
          )
          .addField('Description', commandMeta.description);
      }
    } else {
      for (const command in GameCommandsOBJ) {
        const commandMeta = GameCommandsOBJ[command];
        helpMessage.addField(
          `${commandMeta.name} ${commandMeta.isPrime ? '(Prime)' : ''}`,
          commandMeta.params,
          true
        );
      }
    }
    this.msg.channel
      .send(helpMessage)
      // @ts-ignore
      .then((messageSent: Discord.Message) => messageSent.delete(30000));
  }
}
