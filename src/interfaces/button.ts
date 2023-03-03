import { ButtonInteraction } from 'discord.js';

export default interface Button {
  name: string;

  // TODO: change returnable value type since Promise<any> is a temporary fix
  invoke(interaction: ButtonInteraction, ...args: any[]): Promise<any>;
}
