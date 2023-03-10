import {
  ButtonInteraction,
  InteractionResponse,
  TextBasedChannel,
  ChannelType,
  PermissionsBitField,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from 'discord.js';
import Button from '../base/button';
import ColorUtil from '../utils/color-util';

export default class extends Button {
  public name = 'create-ticket';

  public async execute(
    interaction: ButtonInteraction<'cached'>,
  ): Promise<InteractionResponse | undefined> {
    // check if user have any existing tickets
    const existing = interaction.guild?.channels.cache.find((channel: any) =>
      channel.topic?.includes(interaction.member?.id),
    );
    if (existing) {
      return await interaction.reply({
        embeds: [
          {
            title: 'Ошибка',
            description:
              'У тебя уже открыт тикет!' +
              `\nПроверь канал \`${existing.name}\``,
            color: ColorUtil.RED_COLOR,
          },
        ],
        ephemeral: true,
      });
    }

    // creating new channel and setting permissions for user
    const ticket: TextBasedChannel = await interaction.guild?.channels.create({
      name: `👔┃покупка-${interaction.member?.displayName}`,
      type: ChannelType.GuildText,
      parent: process.env.TICKET_CATEGORY_ID,
      topic: `Канал, где покупает <@${interaction.member?.id}>`,
      permissionOverwrites: [
        {
          id: interaction.guild?.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: interaction.member?.id,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.ReadMessageHistory,
            PermissionsBitField.Flags.SendMessages,
          ],
        },
      ],
    });

    await interaction.reply({
      embeds: [
        {
          title: 'Тикет успешно создан',
          description: `Перейди в канал \`${ticket.name}\``,
          color: ColorUtil.GREEN_COLOR,
        },
      ],
      ephemeral: true,
    });

    // ghost ping for everyone in ticket
    // const message = await ticket.send('@everyone');
    // message.delete();

    const button = new ButtonBuilder()
      .setCustomId('close-ticket')
      .setLabel('🔒 Закрыть тикет')
      .setStyle(ButtonStyle.Primary);

    await ticket.send({
      embeds: [
        {
          title: 'Покупка китов',
          description:
            'Укажи информацию о своем заказе, заполнив формы ниже сообщения' +
            '\n\n> Напиши продавцу в личные сообщения, если не получается заполнить информацию или происходит какая-то ошибка',
          color: ColorUtil.BLUE_COLOR,
          footer: {
            text: 'После заполнения жди ответа, продавец напишет как можно скорее',
          },
        },
      ],
      components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button)],
    });
  }
}
