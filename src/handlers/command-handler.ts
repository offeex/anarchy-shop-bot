import { ApplicationCommandDataResolvable, Collection } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { bot } from '..';
import Command from '../interfaces/command';
import Handler from '../interfaces/handler';

export default class CommandHandler implements Handler {
  public readonly commands: Collection<string, Command> = new Collection();

  public async init(): Promise<void> {
    const slashCommands: ApplicationCommandDataResolvable[] = [];

    const commandPath = path.join(__dirname, '../commands');
    const commandFiles: string[] = fs
      .readdirSync(commandPath)
      .filter((file) => file.endsWith('.js'));
    for (const file of commandFiles) {
      const { default: Command } = await import(`../commands/${file}`);
      const command: Command = Command && new Command();

      slashCommands.push(command.data.toJSON());
      this.commands.set(command.data.name, command);
    }

    if (!slashCommands.length) {
      // no commands to register
      return;
    }

    // TODO: implement deploy script or add smart cache system (most preferrable solution)
    // we shouldn't register commands every time we run bot due to rate limit
    bot.client.on('ready', () => {
      bot.client.application?.commands.set(slashCommands);
      console.log('Registered commands');
    });
  }
}
