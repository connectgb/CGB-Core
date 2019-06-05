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
    playerTurn: number;
    config: {
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
    playerTurn: Math.floor(Math.random() * this.metaConfig.numPlayers),
    config: {
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
      await this.takeTurn(this.GameData.playerTurn).then(next => {
        this.GameData.playerTurn = this.GameData.playerTurn === 1 ? 2 : 1;
      });
    }
  }
  /**
   * Allows the player that is taking his/her's turn to select a slot in the grid
   * @param playerTurn The index of the player that is taking his/her's turn
   */
  async takeTurn(playerTurn: number) {
    const currentBoard = this.drawBoard(),
      // slotEmojis = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'],
      gameBoardDisplayMSG = new Discord.RichEmbed()
        .setTitle(
          `Its ${this.gameMetaData.players[playerTurn].username}'s turn`
        )
        .setDescription(
          `Listening for a slow number 0-${this.GameData.config.boardLength}`
        )
        .setColor(playerTurn === 1 ? '#CF2907' : '#4871EA')
        .addField('Current Board', currentBoard)
        .setFooter(this.gameMetaData.gameID);

    const sentBoardMSG: Discord.Message = (await this.msg.channel.send(
      gameBoardDisplayMSG
    )) as Discord.Message;

    let slotSelected = await this.listenToslotSelection(sentBoardMSG);
    console.log(slotSelected);
    // validating that the selected slot is available etc
    let attempt = 1;
    const attemptLimit = 3;
    while (
      slotSelected > this.GameData.config.boardLength ||
      slotSelected < 0 ||
      this.isPositionTaken(slotSelected, 0) ||
      attempt < attemptLimit
    ) {
      sentBoardMSG.channel.send(
        `${this.gameMetaData.players[playerTurn]} please select a slot 0-${
          this.GameData.config.boardLength
        }`
      );
      slotSelected = await this.listenToslotSelection(sentBoardMSG);
      ++attempt;
    }
    console.log(slotSelected);
  }
  /**
   * Test to ensure the chosen location isn't taken.
   *
   * @param number x_pos The x-position of the location chosen.
   * @param number y_pos The y-position of the location chosen.
   * @return bool returns true or false for the question "Is this spot taken?".
   */
  isPositionTaken(x_pos: number, y_pos: number) {
    return this.GameData.gameBoard[y_pos][x_pos] !== 0;
  }
  async listenToslotSelection(board: Discord.Message): Promise<number> {
    const slotOption = ['0', '1', '3', '4', '5', '6'];
    const playerTurnOnlyFilter: Discord.CollectorFilter = message => {
      console.log(message.user);
      console.log(this.gameMetaData.playerIDs[this.GameData.playerTurn - 1]);
      console.log(slotOption.includes(message.content));

      console.log(
        message.auther.id ===
          this.gameMetaData.playerIDs[this.GameData.playerTurn - 1] &&
          slotOption.includes(message.content)
      );
      if (
        message.auther.id ===
          this.gameMetaData.playerIDs[this.GameData.playerTurn - 1] &&
        slotOption.includes(message.content)
      ) {
        return true;
      }
      return false;
    };
    const selectionMSGs = await board.channel.awaitMessages(
      playerTurnOnlyFilter,
      {
        maxMatches: 1,
        errors: ['Ran out of time!'],
        time: 6000,
      }
    );

    const selectedMSG = selectionMSGs.first();
    if (!selectedMSG) return null;
    const slectedSlot = parseInt(selectedMSG.content, 99);
    await selectedMSG.delete();
    return slectedSlot;
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
