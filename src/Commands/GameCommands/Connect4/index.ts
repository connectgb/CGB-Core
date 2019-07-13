import * as Discord from 'discord.js';
import { OnlineGames } from '../OnlineGame';
import { IGameMetaInfo, GameMD } from '../../../Models/gameState';

/**
 * Connect 4 in a row to win game.
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
    playerTurn: Math.floor(Math.random() * this.metaConfig.numPlayers) + 1,
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
              .then(end => this.RewardPlayers())
              .catch(e => {
                console.log('Game Loop Error');
                console.log(e);
              })
              .finally(() => {
                // console.log('GameClean up!');
                this.cleanUpTheGameData();
              });
          }
        });
      }
      // console.log(this.gameMetaData);
    });
  }
  async GameLifeCicle() {
    this.GameData.onGoing = true;
    // console.log('Game Loop');
    const mainGameBoardMessage:  Discord.Message = await this.msg.channel.send('.').catch(e => console.log(e)) as  Discord.Message
//    console.log(this.args)
    while (this.GameData.onGoing) {
      await this.takeTurn(this.GameData.playerTurn, mainGameBoardMessage).then(async next => {
    // check if player won?
    await this.ValidateWinner(mainGameBoardMessage).catch(e => console.log(e))
     })
      .catch(e => mainGameBoardMessage.edit('There Was An Error In the Game Loop:' + e) );
    }
  }
  /**
   * Allows the player that is taking his/her's turn to select a slot in the grid
   * @param playerTurn The index of the player that is taking his/her's turn
   */
  async takeTurn(playerTurn: number, mainGameBoardMessage: Discord.Message) {
    const currentBoard = this.drawBoard(),
      gameBoardDisplayMSG = new Discord.RichEmbed()
        .setTitle(
          `Its ${this.gameMetaData.players[playerTurn - 1].username}'s turn`
        )
        .setDescription(
          `Listening for a number 1-${this.GameData.config.boardLength+1}`
        )
        .setColor(playerTurn === 1 ? '#4871EA' : '#CF2907')
        .addField('Current Board', currentBoard)
        .setFooter(this.gameMetaData.gameID);

    await mainGameBoardMessage.edit(
      gameBoardDisplayMSG
    )

    let slotSelected = await this.listenToslotSelection(mainGameBoardMessage);
    // validating that the selected slot is available etc
    let attempts = 1;
    const attemptLimit = 3;
    while (
      slotSelected > this.GameData.config.boardLength ||
      slotSelected < 0 ||
      (this.isPositionTaken(slotSelected) && attempts < attemptLimit)
    ) {
      mainGameBoardMessage.channel.send(
        `${this.gameMetaData.players[playerTurn - 1]} please select a slot 1-${
          this.GameData.config.boardLength+1
        }`
      );
      slotSelected = await this.listenToslotSelection(mainGameBoardMessage);
      attempts++;
    }
    if (!this.isPositionTaken(slotSelected)) {
    // places the slot at the bottom
    this.GameData.gameBoard[this.dropToBottom(slotSelected)][
      slotSelected
    ] = playerTurn;
    }

  }
  
  async ValidateWinner(mainGameBoardMessage: Discord.Message) {
      switch (
          this.isVerticalWin() ||
            this.isHorizontalWin() ||
            this.isDiagonalWin() ||
            this.isGameADraw()
        ) {
          case true:
            this.GameData.onGoing = false;
            const gameWinLoseDisplayMSG = new Discord.RichEmbed()
              .addField('Current Board', this.drawBoard())
              .setFooter(this.gameMetaData.gameID);

            switch (this.isGameADraw()) {
              case true:
                gameWinLoseDisplayMSG
                  .setColor('#001900')
                  .setDescription('the game ended in a draw!')
                  .addField('Coins adding', 2, true);
                break;
              default:
                gameWinLoseDisplayMSG
                  .setColor(
                    this.GameData.playerTurn === 1 ? '#4871EA' : '#CF2907'
                  )
                  .addField(
                    'Winner',
                    this.gameMetaData.players[this.GameData.playerTurn - 1],
                    true
                  )
                  .addField('Coins adding', 5, true);
            }
            await mainGameBoardMessage.edit(gameWinLoseDisplayMSG);

            break;
          default:
            this.GameData.playerTurn = this.GameData.playerTurn === 1 ? 2 : 1;
            break;
        }
      
  }
  
  async RewardPlayers() {
                // console.log('Game Loot!');
                if (this.isGameADraw()) {
                  await this.rewardPlayer(
                    2,
                    this.gameMetaData.players[0].id,
                    false
                  );
                  await this.rewardPlayer(
                    2,
                    this.gameMetaData.players[1].id,
                    false
                  );
                } else {
                  const lostIndex = this.GameData.playerTurn === 1 ? 2 : 1;
                  await this.rewardPlayer(
                    5,
                    this.gameMetaData.players[this.GameData.playerTurn - 1].id,
                    true
                  );
                  await this.rewardPlayer(
                    1,
                    this.gameMetaData.players[lostIndex - 1].id,
                    false
                  );
                }
              }
  /**
   * Determine if the game is a draw (all peices on the board are filled).
   *
   * @return bool Returns true or false for the question "Is this a draw?".
   */
  isGameADraw() {
    for (let y = 0; y <= this.GameData.config.boardHeight; y++) {
      for (let x = 0; x <= this.GameData.config.boardLength; x++) {
        if (!this.isPositionTaken(x, y)) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Test to see if somebody got four consecutive horizontal pieces.
   *
   * @return bool Returns true if a win was found, and otherwise false.
   */
  isHorizontalWin() {
    let currentValue = null,
      previousValue = 0,
      tally = 0;

    // Scan each row in series, tallying the length of each series. If a series
    // ever reaches four, return true for a win.
    for (let y = 0; y <= this.GameData.config.boardHeight; y++) {
      for (let x = 0; x <= this.GameData.config.boardLength; x++) {
        currentValue = this.GameData.gameBoard[y][x];
        if (currentValue === previousValue && currentValue !== 0) {
          tally += 1;
        } else {
          // Reset the tally if you find a gap.
          tally = 0;
        }
        if (tally === this.GameData.config.countToWin - 1) {
          return true;
        }
        previousValue = currentValue;
      }

      // After each row, reset the tally and previous value.
      tally = 0;
      previousValue = 0;
    }

    // No horizontal win was found.
    return false;
  }

  /**
   * Test to see if somebody got four consecutive vertical pieces.
   *
   * @return bool Returns true if a win was found, and otherwise false.
   */
  isVerticalWin() {
    let currentValue = null,
      previousValue = 0,
      tally = 0;

    // Scan each column in series, tallying the length of each series. If a
    // series ever reaches four, return true for a win.
    for (let x = 0; x <= this.GameData.config.boardLength; x++) {
      for (let y = 0; y <= this.GameData.config.boardHeight; y++) {
        currentValue = this.GameData.gameBoard[y][x];
        if (currentValue === previousValue && currentValue !== 0) {
          tally += 1;
        } else {
          // Reset the tally if you find a gap.
          tally = 0;
        }
        if (tally === this.GameData.config.countToWin - 1) {
          return true;
        }
        previousValue = currentValue;
      }

      // After each column, reset the tally and previous value.
      tally = 0;
      previousValue = 0;
    }

    // No vertical win was found.
    return false;
  }

  /**
   * Test to see if somebody got four consecutive diagonel pieces.
   *
   * @return bool Returns true if a win was found, and otherwise false.
   */
  isDiagonalWin() {
    let x = null,
      y = null,
      xtemp = null,
      ytemp = null,
      currentValue = null,
      previousValue = 0,
      tally = 0;

    // Test for down-right diagonals across the top.
    for (x = 0; x <= this.GameData.config.boardLength; x++) {
      xtemp = x;
      ytemp = 0;

      while (
        xtemp <= this.GameData.config.boardLength &&
        ytemp <= this.GameData.config.boardHeight
      ) {
        currentValue = this.GameData.gameBoard[ytemp][xtemp];
        if (currentValue === previousValue && currentValue !== 0) {
          tally += 1;
        } else {
          // Reset the tally if you find a gap.
          tally = 0;
        }
        if (tally === this.GameData.config.countToWin - 1) {
          return true;
        }
        previousValue = currentValue;

        // Shift down-right one diagonal index.
        xtemp++;
        ytemp++;
      }
      // Reset the tally and previous value when changing diagonals.
      tally = 0;
      previousValue = 0;
    }

    // Test for down-left diagonals across the top.
    for (x = 0; x <= this.GameData.config.boardLength; x++) {
      xtemp = x;
      ytemp = 0;

      while (0 <= xtemp && ytemp <= this.GameData.config.boardHeight) {
        currentValue = this.GameData.gameBoard[ytemp][xtemp];
        if (currentValue === previousValue && currentValue !== 0) {
          tally += 1;
        } else {
          // Reset the tally if you find a gap.
          tally = 0;
        }
        if (tally === this.GameData.config.countToWin - 1) {
          return true;
        }
        previousValue = currentValue;

        // Shift down-left one diagonal index.
        xtemp--;
        ytemp++;
      }
      // Reset the tally and previous value when changing diagonals.
      tally = 0;
      previousValue = 0;
    }

    // Test for down-right diagonals down the left side.
    for (y = 0; y <= this.GameData.config.boardHeight; y++) {
      xtemp = 0;
      ytemp = y;

      while (
        xtemp <= this.GameData.config.boardLength &&
        ytemp <= this.GameData.config.boardHeight
      ) {
        currentValue = this.GameData.gameBoard[ytemp][xtemp];
        if (currentValue === previousValue && currentValue !== 0) {
          tally += 1;
        } else {
          // Reset the tally if you find a gap.
          tally = 0;
        }
        if (tally === this.GameData.config.countToWin - 1) {
          return true;
        }
        previousValue = currentValue;

        // Shift down-right one diagonal index.
        xtemp++;
        ytemp++;
      }
      // Reset the tally and previous value when changing diagonals.
      tally = 0;
      previousValue = 0;
    }

    // Test for down-left diagonals down the right side.
    for (y = 0; y <= this.GameData.config.boardHeight; y++) {
      xtemp = this.GameData.config.boardLength;
      ytemp = y;

      while (0 <= xtemp && ytemp <= this.GameData.config.boardHeight) {
        currentValue = this.GameData.gameBoard[ytemp][xtemp];
        if (currentValue === previousValue && currentValue !== 0) {
          tally += 1;
        } else {
          // Reset the tally if you find a gap.
          tally = 0;
        }
        if (tally === this.GameData.config.countToWin - 1) {
          return true;
        }
        previousValue = currentValue;

        // Shift down-left one diagonal index.
        xtemp--;
        ytemp++;
      }
      // Reset the tally and previous value when changing diagonals.
      tally = 0;
      previousValue = 0;
    }

    // No diagonal wins found. Return false.
    return false;
  }

  /**
   * If there are empty positions below the one chosen, return the new y-position
   * we should drop the piece to.
   *
   * @param number x_pos The x-position of the location chosen.
   * @param number y_pos The y-position of the location chosen.
   * @return number - The y-position the disc should fall into.
   */
  dropToBottom(x_pos: number, y_pos: number = 0) {
    // Start at the bottom of the column, and step up, checking to make sure
    // each position has been filled. If one hasn't, return the empty position.
    for (let y = this.GameData.config.boardHeight; y > y_pos; y--) {
      if (!this.isPositionTaken(x_pos, y)) {
        return y;
      }
    }
    return y_pos;
  }
  /**
   * Test to ensure the chosen location isn't taken.
   *
   * @param number x_pos The x-position of the location chosen.
   * @param number y_pos The y-position of the location chosen.
   * @return bool returns true or false for the question "Is this spot taken?".
   */
  isPositionTaken(x_pos: number, y_pos: number = 0) {
    return this.GameData.gameBoard[y_pos][x_pos] !== 0;
  }

  async listenToslotSelection(board: Discord.Message): Promise<number> {
    const slotOption = ['1', '2', '3', '4', '5', '6', '7'];
    const playerTurnOnlyFilter: Discord.CollectorFilter = message => {
      // console.log(
      //   message.author.id ===
      //     this.gameMetaData.playerIDs[this.GameData.playerTurn - 1] &&
      //     slotOption.includes(message.content)
      // );
      if (
        message.author.id ===
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
    const slectedSlot = parseInt(selectedMSG.content, 10) -1;
    this.deleteMessageIfCan(selectedMSG)
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
