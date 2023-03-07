import { ButtonInteraction } from 'discord.js';

export default abstract class Button {
  public abstract name: string;

  public abstract execute(
    interaction: ButtonInteraction,
    ...args: any[]
  ): Promise<any> | any;
}
