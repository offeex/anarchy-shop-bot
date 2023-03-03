import { Collection } from 'discord.js';
import fs from 'fs';
import path from 'path';
import Button from '../interfaces/button';
import Handler from '../interfaces/handler';

export default class ButtonHandler implements Handler {
  public readonly buttons: Collection<string, Button> = new Collection();

  public async init(): Promise<void> {
    const buttonPath = path.join(__dirname, '../buttons');
    const buttonFiles: string[] = fs
      .readdirSync(buttonPath)
      .filter((file) => file.endsWith('.js'));
    for (const file of buttonFiles) {
      const { default: Button } = await import(`../buttons/${file}`);
      const button: Button = Button && new Button();

      this.buttons.set(button.name, button);
    }
  }
}
