import {
  ButtonInteraction,
  InteractionResponse,
  MessageInteraction,
} from 'discord.js';
import Button from '../base/button';

export default class extends Button {
  public name = 'confirm-close-ticket';

  public async execute(
    interaction: ButtonInteraction<'cached'>,
  ): Promise<void> {
    // TODO: type non-null assertion
    const channel: any = interaction.channel;

    if (channel?.name.startsWith('👔┃покупка-')) {
      await channel?.permissionOverwrites.edit(interaction.member?.id, {
        ViewChannel: false,
      });

      await interaction.deferUpdate();
      await interaction.message?.edit('Тикет был закрыт');

      await channel?.setName(`👔┃закрыт-${interaction.member?.displayName}`);
    }

    // TODO: reopen ticket
  }
}
