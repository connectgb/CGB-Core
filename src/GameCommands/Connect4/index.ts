import * as Discord from 'discord.js';
import { OnlineGames } from '../OnlineGame';
import { IGameMetaInfo, GameMD } from '../../Models/gameState';

export default class Connect4 extends OnlineGames {
  metaConfig: IGameMetaInfo = {
    title: 'Connect 4',
    numPlayers: 2,
    imageUrl:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5R4_FiAZMoc0RAFLMSLPt7_IocF6WC0SM7t7yWaxGDyAhY7x5mg',
  };
  GameData: { gameBoard: number[][] } = {
    gameBoard: [
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
    ],
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

    this.msg.channel.send(this.drawBoard());
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
