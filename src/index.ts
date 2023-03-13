import { config } from 'dotenv';
import { resolve } from 'path';
import { Bot } from './bot';

config({ path: resolve(__dirname, '..', '.env') });

export const bot = new Bot();

bot.init().then(() => console.log('Bot is ready!'));
