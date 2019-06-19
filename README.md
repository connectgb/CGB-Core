# Online mini-games for Discord

Join the discord to get a feel for the bot in action!
[link to the discord][discordlink] this link is a temparty link there for you will be kick out of server where you disconnect. if you want to join the effort please send me a message

If you want the bot on your server go [HERE](https://www.patreon.com/ConnectGames). You will need to varify your server later on with an Api key which you can get on the website

## Game List

|Primary Command|  Description|
|-                |-                                                      |
|[connect4](#Connect4)|  Connect four of the same colour to win the game.|
 

## Help Functions

|Primary Command |  Description|
|-                |-                                                      |
|[help](#Help)| Show you a list of available commands.|
|[claim](#claim)| Claim rewards (this command can only be ran only in the official server) 
|[!leave](#Leave)| Leave a game, servvice anything that you have joined|
|[!delete](#Delete)| becareful there is no take backs here !|



## Online Games Setup

   #### Confirmation Stage:
   - Sends out a message to the channel which the initial game invite was sent.
   - Both players must accept by reacting with the accept emoji for the game to be registered.
   
   #### validation:
   - Checks if the player is part of the database
   - Whether or not the other players are in a game.
   - Checks if the number of players needed for the game to start is met.

#### End game:
Both players will get experience points for playing each game till the end. The winner will get a extra gold whilst the looser will get a small fraction of that bonus! All players that took part in the game, results will be updated in the database (exp, coins, W/L ratio etc)   

## Prime Commands
Really Good Quality Commands! Too good to be free sorry guys. These commands require [connection](Donators-+-Connection-Levels) levels greater than 2 to run! commands that have been marked prime:
- Have been created by the community developers and verified by an official to be prime!
- May require maintenance each time a user uses these commands as they could include advance systems running.


## Donators + Connection Levels
Becoming a donor allows you to increase your connection level,  more fun, unlock cool perks, bragging rights, access to new and prime commands and did i mention **"MORE FUN"** !

|Name (connection Level)|Price | Description| Perks |
|-                |-   |-  |-|
|Starter (1)|£1 or more per month | For those who just want to play more on different servers whilst helping out the community.|Create more than one account ! Any accounts created on different servers during the time you were a Patron will be kept! (Connection level * 10)|
|Linked (2) | £5 or more per month| **Includes all the perks from Starter**. Become a Beta tester!| Get to use the latest features updates and get to use them before anyone else on the official discord  server. Get the 'Linked' title in the official discord server.|
|Plug (3)|£12.99 or more per month|**Includes all the perks from Linked** and  **Become an Official** Get a louder voice in the community and vote on how you want things to be! | Access to all premium games and including community made functions as well. Get a say on how and what improvements should be done to make the bot better for everyone! Get the 'Plug' title in the official discord server forever! Get the chance to vote and chat in the 'nexus' lobby.|
|Provider (4)|£19.99 or more per month|**Includes all the perks from Plug**. Your the Best! |Helping out your guild members get connected! Give them access to all premium games and including community made Commands. Get the 'Provider' title in the official discord  Limited!

## Connect4

This command will allow players to verse other guild members to a game of classic connect 4.
the objective of the game is to connect 4 of your circles in a row. whether thats in a row horizontally, vertically and diagonally! 

Number of players: 2

#### usage: ~connect4 <@tag challenged play>

The bot will respond with [intial Game setup](#Online-Games-Setup) then the game will be gain! Select a slot to drop your peice by sending a number between 1 - 7. 

## Help
Just a common help command, hope fully you wont need to use this command often.
#### usage: ~help <command>
|Modes |  Description|
|-                |-                                                      |
|none (Default)|Sends the user a list of primary commands|
|command |How to use the command + brief description + if the command is [prime](#Prime-Commands) |

## Claim 
Claim rewards (this command can only be ran only in the official server). 

#### usage: ~claim <mode>
|Modes |  Description|
|-                |-                                                      |
|perks (Default)| Depending on the tag you have in the official server when executing this mode will activate your connection level perks |

## Leave
This command will help you to leavethings that you are in.

#### usage: ~!leave <mode>
	
|Modes |  Description|
|-                |-                                                      |
|game (Default)| Leaves the current game that you are in, no take backs!|

## Delete
This command can not be un done when executed and accepted! Once data has been deleted its **DELETED** .
#### usage: ~!delete <mode>
|Modes |  Description|
|-                |-                                                      |
|account| Deletes the guild Account saves to your user id after a second conformation message from the bot.|
	
[discordlink]: https://discord.gg/qcrVRSF
