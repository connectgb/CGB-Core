import * as Discord from 'discord.js';
import {
  allPlayerTaggedString,
  getMentionedPlayers,
  uuidv4,
} from './HelperFunctions';
import { UserMD, IUserState } from '../Models/userState';
import { IGameMetaData, IGameMetaInfo } from '../Models/gameState';
import mongoose from 'mongoose';
import { UserMD, IUserState } from '../Models/userState';

export class OnlineGames {
  botClient: Discord.Client;
  msg: Discord.Message;
  args: Array<string>;
  hUser: Discord.GuildMember;
  // cPlayers: Array<Discord.GuildMember>;
  gameMetaData: IGameMetaData;
  constructor(
    client: Discord.Client,
    message: Discord.Message,
    cmdArguments: Array<string>
    // DB_CONNECTION: typeof mongoose
  ) {
    // init variables
    this.botClient = client;
    this.msg = message;
    this.args = cmdArguments;
    this.hUser = message.guild.member(message.author);
  }

  // Confirmation Stage Both players Must Accept for the game to be registered
  async GameConfirmationStage(metaConfig: IGameMetaInfo) {
    const acceptEmoji = `🔵`; //'🔵'; '✔️'; ':heavy_check_mark:️'
    const rejectEmoji = `🔴`; //'🔴'; '❌';':x:'

    this.gameMetaData = {
      guildID: this.msg.guild.id,
      gameID: null,
      status: null,
      accepted: false,
      playerIDs: [this.hUser.id],
      players: [this.hUser.user],
      channelID: this.msg.channel.id,
      metaInfo: metaConfig,
    };
    let currentStatusMSG = new Discord.RichEmbed().setTitle(
      `Playing ${metaConfig.title}`
    );
    // .addField('GameID', this.gameMetaData.gameID);

    // the message which the players have to accept
    const ConfirmationMSG = new Discord.RichEmbed()
      .setImage(metaConfig.imageUrl)
      .setTitle(`Playing ${metaConfig.title}`)
      .setDescription(metaConfig.description ? metaConfig.description : '')
      .setColor('#D3D3D3');

    switch (metaConfig.numPlayers) {
      case 1:
        ConfirmationMSG.addField('Player: ', this.hUser);
        break;
    }
    // more than 1
    // write a function that will support more than 1 players games
    if (metaConfig.numPlayers > 1) {
      try {
        const e = await getMentionedPlayers(this.msg);
        // console.log(e);
        const { players, ids } = e;
        this.gameMetaData.playerIDs = this.gameMetaData.playerIDs.concat(ids);
        this.gameMetaData.players = this.gameMetaData.players.concat(players);
      } catch (e) {
        console.log(e);
        return;
      }
    }
    // checks if the number of players match!
    if (
      this.gameMetaData.playerIDs.length !== metaConfig.numPlayers ||
      this.gameMetaData.playerIDs == null
    ) {
      await this.msg.reply(
        `you need to mention ${metaConfig.numPlayers - 1} to players this game`
      );
      return;
    }
    // custume 2 player games
    if (this.gameMetaData.players.length == 2)
      ConfirmationMSG.setAuthor(
        `${this.hUser.user.username} ---VS--- ${
          this.gameMetaData.players[1].username
        }`
      )
        .addField('Challenger: ', this.hUser)
        .addField('Challenge: ', this.gameMetaData.players[1]);

    const awitingForString = allPlayerTaggedString(
      this.gameMetaData.players,
      `to react in ${acceptEmoji} 6s`
    );
    ConfirmationMSG.setFooter(awitingForString);

    let ConfirmationMSGSent: Discord.Message = (await this.msg.channel.send(
      ConfirmationMSG
      //@ts-ignore
    )) as Discord.Message;

    await ConfirmationMSGSent.react(acceptEmoji);
    await ConfirmationMSGSent.react(rejectEmoji);
    // listens for all players decision to play or not
    await ConfirmationMSGSent.awaitReactions(
      //filter function. only players taking part in the game and one the accept and reject emojies are being captured
      (reaction: Discord.MessageReaction, user: Discord.GuildMember) => {
        // Discord.ReactionEmoji
        for (let playerAllowedID in this.gameMetaData.playerIDs) {
          // FINALLY GOT IT !
          // console.log(user.id);
          // console.log(this.gameMetaData.playerIDs[playerAllowedID]);
          // console.log(
          //   user.id === this.gameMetaData.playerIDs[playerAllowedID] &&
          //     (reaction.emoji.name === acceptEmoji ||
          //       reaction.emoji.name === rejectEmoji)
          // );
          if (
            user.id === this.gameMetaData.playerIDs[playerAllowedID] &&
            (reaction.emoji.name === acceptEmoji ||
              reaction.emoji.name === rejectEmoji)
          )
            return true;
        }
        return false;
      },
      { time: 6000 } // waits for 6ms => 6 seconds
    )
      .then(reactionResults => {
        // console.log(reactionResults.get(acceptEmoji));
        if (
          reactionResults.get(acceptEmoji) == null ||
          reactionResults.get(acceptEmoji).count - 1 != metaConfig.numPlayers
        ) {
          // not everyone is ready *minus one for the bot
          this.gameMetaData.status = 'REJECTED';
          currentStatusMSG
            .setDescription('Not Every One Was Ready!')
            .setColor('#003366')
            .addField('Status', this.gameMetaData.status);

          if (
            reactionResults.get(rejectEmoji) &&
            reactionResults.get(rejectEmoji).count - 1 > 0
          ) {
            // console.log(reactionResults.get(rejectEmoji).count);
            // some players rejected the game
            currentStatusMSG
              .setDescription('Someone Rejected!')
              .setColor('#F44336');
          }
        } else {
          // everyone is ready! let the game begin
          this.gameMetaData.status = 'ACCEPTED';
          this.gameMetaData.gameID = `${uuidv4()}`;
          this.gameMetaData.accepted = true;
          console.log(`Starting New Game: ${this.gameMetaData.gameID}`);
          currentStatusMSG
            .setDescription('Connection Made')
            .setColor('#2ECC40')
            .addField('Status', this.gameMetaData.status)
            .addField('GameID', this.gameMetaData.gameID)
            .setFooter('Setting up Game Game...');
        }
        return currentStatusMSG; // not needed but oh-well
      })
      .catch(e => {
        console.log('ERROR: listening to players accept/reject reaction');
        console.log(e);
        return null;
      });
    await ConfirmationMSGSent.delete();
    await this.msg.channel.send(currentStatusMSG);

    return this.gameMetaData.accepted;
  }

  // Means that this function needs to be created in each child
    const hUser = message.guild.member(message.author);
    const cUser = message.guild.member(
      message.mentions.users.first() || message.guild.members.get(this.args[0])
    );
    switch (cUser) {
      // checks if player 2 is mentioned
      case null:
        message.reply('Tag another user use: connect4 <@user>');
        return;
      case hUser:
        message.reply('You Cant vs Yourself!');
        return;
    }
    // makes sure user mentioned is regestered in the db andplayer is not in a game
    //@ts-ignore
    UserMD.byUserIDnGuildID(
      `${this.cUser}`,
      this.msg.guild.id,
      (err: any, userData: IUserState) => {
        if (!userData) {
          this.msg.reply('The user you mentioned isnt in the DB');
          return;
        } else {
          switch (userData.ingame.isInGame) {
            case true:
              const theyAreAlreadyInAGameMSG = new Discord.RichEmbed()
                .setColor('#F44336')
                .setAuthor(`${this.cUser.user.tag}`)
                .setDescription(
                  `Player is already in a game, you can't challenge them to a game untill their current game is over`
                );
              this.msg.channel.send(theyAreAlreadyInAGameMSG);
              break;
            default:
          }
        }
      }
    );
  }
  // means that this function needs to be created in each child
  GameLifeCicle: Promise<void>;
}
