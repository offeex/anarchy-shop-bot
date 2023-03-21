import { ButtonInteraction, ButtonStyle, CategoryChannel, ChannelType, TextBasedChannel } from 'discord.js'
import Button from '../../structures/Button'
import { Ticket, TicketModel } from '../../models/ticket.model'
import { getValue } from '../../utils/storage.util'
import { client } from '../../index'
import { Doc, TicketCategoryEntry } from '../../utils/types.util'
import { activeTickets, createChooseKitPrompt, handleChooseKitPrompt } from '../../managers/ticket.manager'

async function checkTicket(interaction: ButtonInteraction, category: CategoryChannel) {
	const t = await category.children.cache.find(c =>
		c.type === ChannelType.GuildText && c.topic === interaction.user.id
	) as TextBasedChannel

	if (t) {
		t.send(`Ваш тикет находится тут, ${interaction.user}`)
		interaction.reply({ content: 'У вас уже есть тикет', ephemeral: true })
		return t
	}

	return null
}

async function registerTicket(t: TextBasedChannel, interaction: ButtonInteraction): Promise<Doc<Ticket>> {
	await interaction.reply({
		content: `Тикет успешно открыт: ${t}`, ephemeral: true
	})
	return (await TicketModel.findOneAndUpdate(
		{ channelId: t.id, userId: interaction.user.id },
		{},
		{ upsert: true, new: true }
	))
}

export default new Button(
	'create-ticket',
	async interaction => {
		// may be optimized
		const categoryEntries: TicketCategoryEntry[] = await getValue('ticket-categories')
		const categoryId = categoryEntries.find(e => e.name === 'оформление')!.channelId
		const category = await client.guild!.channels.fetch(categoryId) as CategoryChannel

		let ticket = await checkTicket(interaction, category)
		if (ticket) return

		ticket = await category.children.create({
			name: `ticket-${interaction.user.username}`,
			type: ChannelType.GuildText,
			topic: interaction.user.id
		})
		const ticketModel = await registerTicket(ticket, interaction)

		const payload = await createChooseKitPrompt(ticket, ticketModel)
		payload.content = `Привет, выбирай нужны тебе киты, ${interaction.user}`

		activeTickets.set(ticket.id, ticketModel)
		const msg = await ticket.send(payload)

		await handleChooseKitPrompt(msg, ticketModel)
	})
