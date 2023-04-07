import { ButtonBuilder, ButtonStyle, ChannelType, Colors, ComponentType, EmbedBuilder } from 'discord.js'
import Button from '../../../structures/Button'
import { checkPlantingButton, getTicket, ticketFee, ticketStage } from '../../../managers/ticket.manager'
import { client } from '../../../index'
import { actionRow, resolveInteractionUpdate } from '../../../utils/discord.util'

export default new Button('ticket-confirm-kits', async interaction => {
	await resolveInteractionUpdate(interaction)

    const t = await getTicket(interaction)
    const ts = ticketStage(t)
    const msg = ts.create

    if (!msg) return interaction.reply('Да как так нахер :(')
    if (await checkPlantingButton(msg, t)) return

    // preparing ticket-planting
    const embed = new EmbedBuilder()
      .setTitle('Способ доставки')
      .setColor('DarkGold')
      .addFields([
          { name: 'Кладом', value: 'Оставим закладку' },
          { name: 'На руки', value: 'Выдадим прямо вам' }
      ])
    const plantButton = new ButtonBuilder()
      .setCustomId('ticket-planting-plant')
      .setStyle(ButtonStyle.Primary)
      .setLabel('Кладом')
    const handoverButton = new ButtonBuilder()
      .setCustomId('ticket-planting-handover')
      .setStyle(ButtonStyle.Secondary)
      .setLabel('На руки')
    const buttonsAr = actionRow(plantButton)

    let skip = false
    const tf = ticketFee(t)
    tf.totalAmount = t.kits.map(k => k.amount).reduce((a, b) => a + b)
    if (tf.totalAmount < 27) buttonsAr.addComponents(handoverButton)
    else {
        skip = true
        plantButton.setDisabled(true)
    }

    ts.planting = await msg.reply({ embeds: [embed], components: [buttonsAr] })

    if (skip) await client.buttons.get('ticket-planting-plant')!.execute(interaction)
})
