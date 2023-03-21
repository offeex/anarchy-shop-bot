import { ButtonStyle, ChannelType } from 'discord.js'
import Button from '../../structures/Button'
import { activeTickets, getTicketContent } from '../../managers/ticket.manager'

export default new Button(
	'ticket-continue',
	async interaction => {
		const ticketModel = activeTickets.get(interaction.channel!.id)!
		ticketModel.save()
		await interaction.reply(`Тикет сохранён ${getTicketContent(ticketModel)}`)
	})
