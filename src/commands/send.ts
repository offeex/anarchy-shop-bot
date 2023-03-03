import {
  ButtonBuilder,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from 'discord.js';
import Command from '../interfaces/command';
import ColorUtil from '../utils/color-util';

// TODO: replace with complete embed manager that can do more stuff
export default class implements Command {
  public data = new SlashCommandBuilder()
    .setName('send')
    .setDescription('Easy-to-use embed manager')
    .addStringOption((option) =>
      option
        .setName('layout')
        .setDescription('Layout name')
        .setRequired(true)
        .addChoices(
          { name: 'Ticket system', value: 'create-ticket' },
          { name: 'Assortment', value: 'assortment-kits' },
        ),
    );

  public async invoke(interaction: ChatInputCommandInteraction): Promise<void> {
    const layout = interaction.options.getString('layout');

    await interaction.deferReply();
    await interaction.deleteReply();

    switch (layout) {
      case 'create-ticket': {
        const button = new ButtonBuilder()
          .setCustomId('create-ticket')
          .setLabel('🛒 Открыть тикет')
          .setStyle(ButtonStyle.Primary);

        await interaction.channel?.send({
          embeds: [
            {
              title: 'Оформление заказа',
              description: 'Нажми на кнопку ниже',
              color: ColorUtil.BLUE_COLOR,
              footer: { text: 'Желаем удачи и успешных покупок!' },
            },
          ],
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(button),
          ],
        });
        break;
      }
      case 'assortment-kits': {
        // TODO: implement
        break;
      }
      default: {
        break;
      }
    }
  }
}
