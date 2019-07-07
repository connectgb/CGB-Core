//import { config } from "dotenv"
//require('dotenv').config()
//config()
import { Database } from './Database';
import { DiscordBotRun } from './discordBot';

new Database();
new DiscordBotRun();
