import Button from '../../structures/Button'
import { ButtonStyle, ComponentType } from 'discord.js'
import { activeTickets, createChooseKitPrompt, handleChooseKitPrompt } from '../../managers/ticket.manager'

export default new Button(
	'ticket-next-kit',
	async interaction => {
		const ticket = interaction.channel!
		const ticketModel = activeTickets.get(ticket.id)!

		const payload = await createChooseKitPrompt(ticket, ticketModel)
		const reply = await interaction.reply(payload)

		await handleChooseKitPrompt(await reply.fetch(), ticketModel)
	}
)