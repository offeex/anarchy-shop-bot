import fs from 'fs';
import path from 'path';
import { bot } from '..';
import Event from '../interfaces/event';
import Handler from '../interfaces/handler';

export default class EventHandler implements Handler {
  public readonly events: Event[] = [];

  public async init(): Promise<void> {
    const eventPath = path.join(__dirname, '../events');
    const eventFiles: string[] = fs
      .readdirSync(eventPath)
      .filter((file) => file.endsWith('.js'));
    for (const file of eventFiles) {
      const { default: Event } = await import(`../events/${file}`);
      const event: Event = Event && new Event();

      if (!event?.on) {
        continue;
      }

      this.events.push(event);
    }
    if (!this.events.length) {
      // return because we don't have any events to register
      return;
    }
    for (const event of this.events) {
      bot.client.on(event?.on, event?.invoke.bind(event));
    }
  }
}
