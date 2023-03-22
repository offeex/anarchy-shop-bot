import {ButtonBuilder, ButtonStyle, ChannelType, Colors, ComponentType, EmbedBuilder,} from 'discord.js'
import Button from '../../../structures/Button'
import {checkPlantingButton, getTicket, ticketFees, ticketMessages} from '../../../managers/ticket.manager'
import {client} from '../../../index'
import {actionRow, resolveInteraction} from '../../../utils/discord.util'

export default new Button('ticket-planting', async interaction => {
    await resolveInteraction(interaction)

    const tm = await getTicket(interaction)
    const msgStageCreate = ticketMessages.get(tm.id)!.create!

    if (await checkPlantingButton(msgStageCreate, tm)) return

    const embed = new EmbedBuilder()
        .setTitle('Способ доставки')
        .setColor(Colors.DarkGold)
        .addFields([
            {name: 'Кладом', value: 'Оставим закладку'},
            {name: 'На руки', value: 'Выдадим прямо вам'},
        ])
    const plantButton = new ButtonBuilder()
        .setCustomId('ticket-spot-plant')
        .setStyle(ButtonStyle.Primary)
        .setLabel('Кладом')
    const handoverButton = new ButtonBuilder()
        .setCustomId('ticket-spot-handover')
        .setStyle(ButtonStyle.Secondary)
        .setLabel('На руки')
    const buttonsAr = actionRow(plantButton)

    let skip = false
    let totalAmount = tm.kits.map(k => k.amount).reduce((a, b) => a + b)
    if (totalAmount < 27) {
        buttonsAr.addComponents(handoverButton)
        ticketFees.set(tm.id, {totalAmount})
    } else {
        skip = true
        plantButton.setDisabled(true)
        tm.planting = 'plant'
    }

    const reply = await msgStageCreate.reply({embeds: [embed], components: [buttonsAr]})
    ticketMessages.set(tm.id, {planting: reply})

    if (skip) await client.buttons.get('ticket-spot-plant')!.execute(interaction)
})
