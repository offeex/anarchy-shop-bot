import Button from '../../../structures/Button'
import {getTicket, getTicketContent, ticketMessages,} from '../../../managers/ticket.manager'

export default new Button('ticket-reset-kits', async interaction => {
    interaction.deferUpdate()

    const tm = await getTicket(interaction)
    if (tm.kits.length !== 0) {
        tm.kits = []
        const msg = ticketMessages.get(tm.id)!.create!
        msg.edit({content: getTicketContent(tm)})
    }
})