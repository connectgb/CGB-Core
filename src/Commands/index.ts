import HelpCommand from './ToolCommands/HelpCommand';
import Connect4 from './GameCommands/Connect4';
import leaveCommand from './ToolCommands/leaveCommand';
import deleteCommand from './ToolCommands/deleteCommand';
import ClaimPatreonRewardsCommand from './RewardCommands/Claim';

interface CommandObj {
  execute: any;
  isPrime: boolean;
  name: string;
  description: string;
  params?: string;
}
export const GameCommandsOBJ: { [key: string]: CommandObj } = {
  help: {
    execute: HelpCommand,
    name: 'Help',
    isPrime: false,
    description:
      'shows the full lest of primary commands and extra command information.',
    params: 'HelpCommand <command>',
  },
  connect4: {
    execute: Connect4,
    name: 'Connect 4',
    isPrime: false,
    description: 'play Connect 4 with a friend',
    params: 'connect4 <@mention>',
  },
  claim: {
    execute: ClaimPatreonRewardsCommand,
    name: 'Claim',
    isPrime: false,
    description: 'Claim your rewards!',
    params: 'claim <Mode?> \nDefault:perks \nOptions:perks',
  },
  '!leave': {
    execute: leaveCommand,
    name: 'Leave',
    isPrime: false,
    description:
      'WARNING: removes yourself from the current game that you are in',
    params: '!leave <Mode?> \nDefault: game \nOptions: game',
  }, //TODO a class that will make you leave the game and make the opponent automaticly win!
  '!delete': {
    execute: deleteCommand,
    name: 'Delete',
    isPrime: false,
    description: 'Delete something',
    params: '!delete <Mode?> \nDefault:null \nOptions: account',
  },
};
