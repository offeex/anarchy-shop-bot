import Button from '../../../structures/Button'
import { getTicket, ticketStage } from '../../../managers/ticket.manager'
import { toggleComponents } from '../../../utils/discord.util'

export default new Button('ticket-delivery-ready', async interaction => {
  const t = getTicket(interaction)
  if (!t) return interaction.deferUpdate()

  const coords = `**${t.spot.x} ${t.spot.z}**`
  await interaction.reply(`Ожидайте на ${coords}, пока курьер прилетит, не выходите из игры!`)

  const msg = ticketStage(t).delivery!
  await toggleComponents(msg, true)

  setTimeout(() =>
    toggleComponents(msg, false),
    1000 * 60 * parseInt(process.env.HANDOVER_COOLDOWN ?? '120')
  )
})