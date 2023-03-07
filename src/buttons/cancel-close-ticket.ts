import { ButtonInteraction } from 'discord.js';
import { bot } from '..';
import Button from '../base/button';

export default class extends Button {
  public name = 'cancel-close-ticket';

  public async execute(interaction: ButtonInteraction): Promise<void> {
    await interaction.deferUpdate();
    await interaction.deleteReply();
  }
}
