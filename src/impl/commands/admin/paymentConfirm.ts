import { SlashCommand } from '../../../structures/command/SlashCommand'
import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { getTicket, handlePayment } from '../../../managers/ticket.manager'

export default new SlashCommand(
  new SlashCommandBuilder()
    .setName('payment-confirm')
    .setDescription('Вручную подтверждаем оплату')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async interaction => {

    const chan = interaction.channel
    if (!chan || chan.type !== ChannelType.GuildText || chan.parent?.name !== 'оформление') {
      await interaction.reply({ content: 'Чё-то отвалилось!', ephemeral: true })
			return
		}

    const t = getTicket(interaction)
    await handlePayment(t, interaction)
  }
)