import {
	ButtonBuilder,
	ButtonStyle,
	CategoryChannel,
	ChannelType,
	ComponentType,
	DiscordjsError,
	OverwriteType
} from 'discord.js'
import Button from '../../../structures/Button'
import { getValue } from '../../../utils/storage.util'
import { client } from '../../../index'
import { TicketCategoryEntry, TicketFees, TicketStages } from '../../../utils/types.util'
import {
	activeTickets,
	checkTicket,
	createChooseKitMenus,
	handleChooseKitMenus,
	ticketFees,
	ticketStage,
	ticketStages
} from '../../../managers/ticket.manager'
import { Ticket } from '../../../models/ticket.model'
import { actionRow } from '../../../utils/discord.util'

export default new Button('create-ticket', async interaction => {
	// may be optimized
	const categoryEntries: TicketCategoryEntry[] = await getValue('ticket-categories')
	const categoryId = categoryEntries.find(e => e.name === 'оформление')!.channelId
	const category = (await client.guild!.channels.fetch(categoryId)) as CategoryChannel

	let tChannel = await checkTicket(interaction, category)
	if (tChannel) return

	tChannel = await category.children.create({
		name: `ticket-${interaction.user.username}`,
		type: ChannelType.GuildText,
		topic: interaction.user.id,
	})
	await tChannel.permissionOverwrites.create(
		interaction.user,
		{ ViewChannel: true, SendMessages: true, ReadMessageHistory: true },
	)

	await interaction.reply({
		content: `Тикет успешно открыт: ${tChannel}`,
		ephemeral: true
	})

	const t = new Ticket()
	t.channelId = tChannel!.id
	t.userId = interaction.user.id
	ticketStages.set(tChannel.id, new TicketStages())
	ticketFees.set(tChannel.id, new TicketFees())

	const ts = ticketStage(t)
	setTimeout(() => {
		if (t.category === 'order') {
			ticketStages.delete(t.channelId)
			ticketFees.delete(t.channelId)

			const index = activeTickets.indexOf(t)
			if (index > -1) {
				activeTickets.length = 0
				activeTickets.push(...activeTickets.splice(index, 1))
			}

			tChannel?.delete().catch((err: DiscordjsError) => {
				console.error("Unpaid ticket deletion error: ", err.message)
			})
			interaction.user.send('Время оформления заказа истекло, тикет закрыт')
		}
	}, 1000 * parseInt(process.env.OFFER_STAGE_TIMEOUT ?? '60'))

	const payload = createChooseKitMenus(tChannel, t)
	const continueButton = new ButtonBuilder()
		.setCustomId('ticket-confirm-kits')
		.setStyle(ButtonStyle.Primary)
		.setLabel('Я всё выбрал')
	const resetKitsButton = new ButtonBuilder()
		.setCustomId('ticket-reset-kits')
		.setStyle(ButtonStyle.Danger)
		.setLabel('Сбросить выбор')
	payload.content = `Привет, выбирай нужны тебе киты, ${interaction.user}`
	payload.components!.push(actionRow(continueButton, resetKitsButton))

	activeTickets.push(t)
	const msg = await tChannel.send(payload)
	ts.create = msg

	await handleChooseKitMenus(msg, t)
})
