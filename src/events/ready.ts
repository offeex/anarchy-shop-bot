import { Events } from 'discord.js';
import { bot } from '..';
import Event from '../interfaces/event';

export default class ReadyEvent implements Event {
	public on = Events.ClientReady;

	public invoke(): void {
		console.log(`Ready! Logged in as ${bot.client.user?.tag}`);
	}
}
