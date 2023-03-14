import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
} from 'discord.js'
import Button from '../structures/Button'

export default new Button('close-ticket', async (interaction: ButtonInteraction) => {
  const channel: any = interaction.channel

  if (channel?.name.startsWith('👔┃закрыт-')) {
    await channel?.delete()
    return
  }

  const close = new ButtonBuilder()
    .setCustomId('confirm-close-ticket')
    .setLabel('🔒 Закрыть')
    .setStyle(ButtonStyle.Danger)

  const cancel = new ButtonBuilder()
    .setCustomId('cancel-close-ticket')
    .setLabel('Отмена')
    .setStyle(ButtonStyle.Secondary)

  await interaction.reply({
    content: 'Ты уверен, что хочешь закрыть тикет?',
    components: [new ActionRowBuilder<ButtonBuilder>().addComponents(close, cancel)],
    ephemeral: true,
  })
})
