import * as Discord from 'discord.js';
import { UserMD, IUserState } from '../Models/userState';
export function allPlayerTaggedString(
  ArrayOfPlayers: Array<Discord.User>,
  endMessage: string
) {
  // console.log(ArrayOfPlayers);
  let allPlayersMentionedMsg = 'Awaiting for ';
  for (let i = 0; i < ArrayOfPlayers.length - 1; i++) {
    allPlayersMentionedMsg += `${ArrayOfPlayers[i].username}, `;
  }
  allPlayersMentionedMsg += `and ${
    ArrayOfPlayers[ArrayOfPlayers.length - 1].username
  } ${endMessage}`;
  return allPlayersMentionedMsg;
}

export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getMentionedPlayers(msg: Discord.Message) {
  let playersinfo: {
    players: Discord.User[];
    ids: String[];
  } = {
    players: [],
    ids: [],
  };

  // makes sure user mentioned is regestered in the db andplayer is not in a game
  await msg.mentions.users.forEach(function(user) {
    // @ts-ignore
    UserMD.byUserIDnGuildID(
      `${user.id}`,
      msg.guild.id,
      async (err: any, userData: IUserState) => {
        // console.log(userData);
        if (!userData) {
          await msg.reply(`The user ${user} you mentioned isnt in the DB`);
          return;
        } else if (userData.ingame.isInGame === true) {
          const theyAreAlreadyInAGameMSG = new Discord.RichEmbed()
            .setColor('#F44336')
            .setAuthor(user)
            .setDescription(
              `player is already in a game, you can't challenge them to a game untill their current game is over`
            );
          await msg.channel.send(theyAreAlreadyInAGameMSG);
          return;
        } else {
          // console.log(this.gameMetaData.playerIDs);
        }
      }
    );

    playersinfo.players.push(user);
    playersinfo.ids.push(msg.guild.member(user).id);
    // console.log(playersinfo.ids);
  });

  // console.log('reached here');
  if (playersinfo.ids && playersinfo.ids === undefined) {
    // checks if player 2 is mentioned
    await msg.reply('Tag another user use: <@user>');
    return;
  }
  // checks if your not vs yourself
  if (msg.author.id in playersinfo.ids) {
    await msg.reply('Cannot Tag Yourself!');
    return;
  } else {
    // console.log(playersinfo.ids);
    return playersinfo;
  }
}
