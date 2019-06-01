import Connect4 from './Connect4';
import leaveGame from './leaveGame';
export const GameCommandsOBJ: { [key: string]: any } = {
  connect4: Connect4,
  '!leaveGame': leaveGame, //TODO a class that will make you leave the game and make the opponent automaticly win!
};
