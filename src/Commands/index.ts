import Connect4 from './GameCommands/Connect4';
import leaveGame from './ToolCommands/leaveGame';
import delAccount from './ToolCommands/delAccount';

export const GameCommandsOBJ: { [key: string]: any } = {
  connect4: Connect4,
  '!leaveGame': leaveGame, //TODO a class that will make you leave the game and make the opponent automaticly win!
  '!delAccount': delAccount,
};
