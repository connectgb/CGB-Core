import * as Discord from 'discord.js';
import { UserMD, IUserState } from '../../Models/userState';
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
  const usersIter = msg.mentions.users.values();
  // msg.mentions.users.forEach(async function(user) {
  for (let i = 0; i < msg.mentions.users.size; i++) {
    let user = usersIter.next();
    // @ts-ignore
    const userData: IUserState = await UserMD.byUserIDnGuildID(
      `${user.value.id}`,
      msg.guild.id
    ).exec();

    if (!userData) {
      await msg.reply(`The user ${user.value} you mentioned isnt in the DB`);
    } else if (userData.ingame.isInGame === true) {
      const theyAreAlreadyInAGameMSG = new Discord.RichEmbed()
        .setColor('#F44336')
        .setAuthor(user.value.username)
        .setDescription(
          `player is already in a game, you can't challenge them to a game untill their current game is over`
        );
      await msg.channel.send(theyAreAlreadyInAGameMSG);
    } else {
      playersinfo.players.push(user.value);
      playersinfo.ids.push(msg.guild.member(user.value).id);
    }
  }

  // console.log(playersinfo.ids);
  // console.log('reached here');
  if (playersinfo.ids && playersinfo.ids.length === 0) {
    // checks if player 2 is mentioned
    await msg.reply('Tag another user use: <@user>');
    return;
  }
  // checks if your not vs yourself

  if (playersinfo.ids.includes(msg.author.id)) {
    const noTagSelf = new Discord.RichEmbed()
      .setColor('#F44336')
      .setTitle('Error')
      .setDescription('You cannot tag yourself!');

    await msg.channel.send(noTagSelf);


    return;
  } else {
    // console.log(playersinfo.ids);
    return playersinfo;
  }
}
