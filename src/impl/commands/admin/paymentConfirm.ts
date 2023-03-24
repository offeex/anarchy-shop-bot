import { SlashCommand } from '../../../structures/command/SlashCommand'
import { ChannelType, SlashCommandBuilder } from 'discord.js'
import { getTicket, handlePayment } from '../../../managers/ticket.manager'

export default new SlashCommand(
  new SlashCommandBuilder()
    .setName('payment-confirm')
    .setDescription('Вручную подтверждаем оплату'),
  async interaction => {
    await interaction.deferReply({ ephemeral: true })

    const chan = interaction.channel
    if (!chan || chan.type !== ChannelType.GuildText || chan.parent?.name !== 'оформление') {
      await interaction.editReply('Чё-то отвалилось!')
			return
		}

    const t = getTicket(interaction)
    await handlePayment(t, interaction)
  }
)