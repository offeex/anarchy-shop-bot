import { Events } from 'discord.js';
import { bot } from '..';
import Event from '../base/event';

export default class extends Event {
  public on = Events.ClientReady;

  public execute(): any {
    console.log(`Ready! Logged in as ${bot.client.user?.tag}`);
  }
}
