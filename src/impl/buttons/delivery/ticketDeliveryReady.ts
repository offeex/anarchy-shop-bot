import Button from '../../../structures/Button'
import { getTicket, ticketStage } from '../../../managers/ticket.manager'
import { toggleComponents } from '../../../utils/discord.util'

export default new Button('ticket-delivery-ready', async interaction => {
  const t = getTicket(interaction)

  const coords = `**${t.spot.x} ${t.spot.z}**`
  await interaction.reply(`Ожидайте на ${coords}, пока курьер прилетит, не выходите из игры!`)

  const msg = ticketStage(t).delivery!
  await toggleComponents(msg, true)

  await new Promise(() => setTimeout(async () => await toggleComponents(msg, false), 1000 * 10))
})