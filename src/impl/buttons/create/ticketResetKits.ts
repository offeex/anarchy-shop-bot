import Button from '../../../structures/Button'
import { getTicket, getTicketContent, ticketStage } from '../../../managers/ticket.manager'
import { resolveInteraction } from '../../../utils/discord.util'

export default new Button('ticket-reset-kits', async interaction => {
	await resolveInteraction(interaction)

	const t = await getTicket(interaction)
	if (t.kits.length !== 0) {
		t.kits = []
		await ticketStage(t).create!.edit({ content: getTicketContent(t) })
	}
})