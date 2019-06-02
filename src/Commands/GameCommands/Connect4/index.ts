import * as Discord from 'discord.js';
import { OnlineGames } from '../OnlineGame';
import { IGameMetaInfo, GameMD } from '../../../Models/gameState';

/**
 * Connect 4 in a wor to win game.
 * https://github.com/bryanbraun/connect-four
 */
export default class Connect4 extends OnlineGames {
  metaConfig: IGameMetaInfo = {
    title: 'Connect 4',
    numPlayers: 2,
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5R4_FiAZMoc0RAFLMSLPt7_IocF6WC0SM7t7yWaxGDyAhY7x5mg',
  };
  GameData: {
    gameBoard: number[][];
    config: {
      playerTurn: number;
      countToWin: number;
      boardLength: number;
      boardHeight: number;
    };
    onGoing: boolean;
  } = {
    onGoing: null,
    gameBoard: [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ],
    config: {
      playerTurn: Math.floor(Math.random() * this.metaConfig.numPlayers),
      countToWin: 4,
      // note: board dimensions are zero-indexed
      boardLength: 6,
      boardHeight: 5,
    },
  };
  constructor(
    client: Discord.Client,
    message: Discord.Message,
    cmdArguments: Array<string>
  ) {
    super(client, message, cmdArguments);

    this.GameConfirmationStage().then(start => {
      if (start) {
        this.InitializeGameInDB().then(ready => {
          if (ready) {
            this.GameLifeCicle()
              .then(end => {
                console.log('Game Loot!');
              })
              .catch(e => {
                console.log('Game Loop Error');
                console.log(e);
              })
              .finally(() => {
                console.log('GameClean up!');
                this.cleanUpTheGameData();
              });
          }
        });
      }
      // console.log(this.gameMetaData);
    });
  }
  async GameLifeCicle() {
    console.log('Game Loop');
    this.GameData.onGoing = true;
    while (this.GameData.onGoing) {
      await this.takeTurn(this.GameData.config.playerTurn);
    }
  }
  /**
   * Allows the player that is taking his/her's turn to select a slot in the grid
   * @param playerTurn The index of the player that is taking his/her's turn
   */
  async takeTurn(playerTurn: number) {
    const currentBoard = this.drawBoard();
    const slotEmojis = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
    const gameBoardDisplayMSG = new Discord.RichEmbed()
      .setColor(playerTurn === 1 ? '#CF2907' : '#4871EA')
      .addField('Board', currentBoard)
      .setFooter(this.gameMetaData.gameID);

    const sentBoardMSG: Discord.Message = (await this.msg.channel.send(
      gameBoardDisplayMSG
    )) as Discord.Message;

    let reactionsToAdd: Promise<Discord.MessageReaction>[] = [];
    slotEmojis.forEach(emo => {
      reactionsToAdd.push(sentBoardMSG.react(emo));
    });
    await Promise.all(reactionsToAdd);
  }

  drawBoard() {
    let board = '';
    for (let row = 0; row < this.GameData.gameBoard.length; row++) {
      for (let col = 0; col < this.GameData.gameBoard[row].length; col++) {
        switch (this.GameData.gameBoard[row][col]) {
          case 1:
            board += ':large_blue_circle:';
            break;
          case 2:
            board += ':red_circle:';
            break;
          default:
            board += ':white_circle:';
        }
      }
      board += '\n';
    }
    return board;
  }
}
