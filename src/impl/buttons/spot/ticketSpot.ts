import Button from '../../../structures/Button'
import {getTicket, ticketFees, ticketMessages} from '../../../managers/ticket.manager'
import {
    ButtonBuilder,
    ButtonStyle,
    Colors,
    ComponentType,
    EmbedBuilder,
    MessageActionRowComponentBuilder,
} from 'discord.js'
import {PlantingType} from '../../../utils/types.util'
import {actionRow, resolveInteraction, toggleActionRowBuilder, toggleComponents,} from '../../../utils/discord.util'
import {client} from '../../../index'

export default new Button(
    ['ticket-spot-plant', 'ticket-spot-handover'],
    async interaction => {
        const isNewInteraction = await resolveInteraction(interaction)

        const tm = await getTicket(interaction)
        tm.planting = isNewInteraction
            ? (interaction.customId.split('-')[2] as PlantingType)
            : 'plant'
        const msg = await toggleComponents(ticketMessages.get(tm.id)!.planting!, true)

        const plantingReply = await msg.reply(
            `Способ доставки выбран: **${tm.planting === 'plant' ? 'Кладом' : 'На руки'}**`
        )

        const embed = new EmbedBuilder()
            .setTitle('Место назначения')
            .setColor(Colors.DarkVividPink)
            .addFields([
                {
                    name: 'Выбрать место',
                    value:
                        'Выберите место, куда будет доставлен заказ. До 20к по обычному миру - бесплатно',
                },
                {
                    name: 'Сгенерировать',
                    value:
                        'Автоматически генерирует конечную точку заказа, до 16к по обычному миру',
                },
            ])
        const pickButton = new ButtonBuilder()
            .setCustomId('ticket-payment-pick')
            .setLabel('Выбрать локацию')
            .setStyle(ButtonStyle.Primary)
        const generateButton = new ButtonBuilder()
            .setCustomId('ticket-payment-generate')
            .setLabel('Сгенерировать')
            .setStyle(ButtonStyle.Secondary)
        const spotAr = actionRow(pickButton)

        if (tm.planting == 'handover') {
            toggleActionRowBuilder(spotAr, true)
            const totalAmount = ticketFees.get(tm.id)!.totalAmount!
            ticketFees.set(tm.id, {plantingPriority: totalAmount * 0.25})
        } else spotAr.addComponents(generateButton)

        const reply = await plantingReply.reply({embeds: [embed], components: [spotAr]})
        ticketMessages.set(tm.id, {spot: reply})

        if (tm.planting === 'handover')
            await client.buttons.get('ticket-payment-pick')!.execute(interaction)
    }
)
