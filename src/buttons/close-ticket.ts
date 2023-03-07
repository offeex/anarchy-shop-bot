import {
  ButtonInteraction,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from 'discord.js';
import Button from '../base/button';

export default class extends Button {
  public name = 'close-ticket';

  public async execute(interaction: ButtonInteraction): Promise<void> {
    const close = new ButtonBuilder()
      .setCustomId('confirm-close-ticket')
      .setLabel('🔒 Закрыть')
      .setStyle(ButtonStyle.Danger);

    const cancel = new ButtonBuilder()
      .setCustomId('cancel-close-ticket')
      .setLabel('Отмена')
      .setStyle(ButtonStyle.Secondary);

    await interaction.reply({
      content: 'Ты уверен, что хочешь закрыть тикет?',
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(close, cancel),
      ],
      ephemeral: true,
    });
  }
}
