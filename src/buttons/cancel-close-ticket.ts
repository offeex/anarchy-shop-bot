import { ButtonInteraction } from 'discord.js';
import Button from '../base/button';

export default class extends Button {
  public name = 'cancel-close-ticket';

  public async execute(
    interaction: ButtonInteraction<'cached'>,
  ): Promise<void> {
    await interaction.deferUpdate();
    await interaction.deleteReply();
  }
}
