import Button from '../../../structures/Button'
import { getTicket, ticketStage } from '../../../managers/ticket.manager'
import { TicketModel } from '../../../models/ticket.model'
import { TextChannel } from 'discord.js'
import { getValue } from '../../../utils/storage.util'
import { TicketCategoryEntry } from '../../../utils/types.util'

async function wait(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

export default new Button(
	'ticket-payment', async interaction => {
		await interaction.deferReply()

		const t = await getTicket(interaction)

		await wait(4000)
		const reply = await interaction.editReply('Оплата прошла успешно')
		const paymentStatus = true // simulation

		if (!paymentStatus) return
		ticketStage(t).success = reply

		const chan = await interaction.channel! as TextChannel
		const categories: TicketCategoryEntry[] = await getValue('ticket-categories')
		await chan.setParent(categories.find(c => c.name === 'доставка')!.channelId)
		await chan.setRateLimitPerUser(15)


		await TicketModel.findOneAndUpdate(
			{ channelId: t.channelId, userId: interaction.user.id },
			{},
			{ upsert: true, new: true }
		)
	}
)