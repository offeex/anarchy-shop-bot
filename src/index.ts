import { config } from 'dotenv'
import { Bot } from './bot'

config()

export const bot = new Bot()
bot.init().then(() => console.log('Bot is ready!'))
