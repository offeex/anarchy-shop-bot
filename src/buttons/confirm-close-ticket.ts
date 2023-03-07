import { ButtonInteraction } from 'discord.js';
import { bot } from '..';
import Button from '../base/button';

export default class extends Button {
  public name = 'confirm-close-ticket';

  public async execute(
    interaction: ButtonInteraction<'cached'>,
  ): Promise<void> {
    const channel: any = interaction.channel;

    if (channel?.name.startsWith('👔┃покупка-')) {
      await channel?.permissionOverwrites.edit(interaction.member?.id, {
        ViewChannel: false,
      });

      await channel?.setName(`👔┃закрыт-${interaction.member?.displayName}`);
    }

    await interaction.deferUpdate();

    // TODO: reopen ticket
  }
}
