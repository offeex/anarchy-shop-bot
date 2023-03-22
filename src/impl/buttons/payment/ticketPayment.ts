import Button from '../../../structures/Button'
import {SpotType} from '../../../utils/types.util'
import {ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, TextChannel} from 'discord.js'
import {getTicket, parseCustomSpot, ticketFees, ticketMessages,} from '../../../managers/ticket.manager'
import {randomVec2} from '../../../utils/number.util'
import {actionRow, resolveInteraction, toggleComponents,} from '../../../utils/discord.util'
import {offers} from '../../../managers/offer.manager'
import {orderedText, paymentText} from '../../../utils/text.util'

export default new Button(
    ['ticket-payment-pick', 'ticket-payment-generate'],
    async interaction => {
        const isInteractionNew = await resolveInteraction(interaction)

        const tm = await getTicket(interaction)
        const msg = ticketMessages.get(tm.id)!.spot!
        let spotType = isInteractionNew
            ? (interaction.customId.split('-')[2] as SpotType)
            : 'pick'

        await toggleComponents(msg, true)

        if (spotType === 'pick') {
            const chan = (await interaction.channel) as TextChannel
            const cont = `Введи координаты в таком формате: -100 100, где первое число х, а второе z соответственно`
            const {x, y} = await parseCustomSpot(chan, cont, [])
            const distance = Math.hypot(x, y)
            ticketFees.set(tm.id, {spotDistance: distance > 40000 ? distance * 0.00125 : 0})
            tm.spot = {x, y}
        } else if (spotType === 'generate')
            tm.spot = randomVec2({x: -16000, y: -16000}, {x: 16000, y: 16000})

        const reply = await msg.reply(
            `Место назначения выбрано: **${tm.spot!.x} ${tm.spot!.y}**`
        )

        // oplata
        const productsPrice = tm.kits
            .map(kit => kit.amount * offers.find(o => o.name === kit.name)!.price)
            .reduce((a, b) => a + b)
        const plantingFee = ticketFees.get(tm.id)?.plantingPriority ?? 0
        const spotFee = ticketFees.get(tm.id)?.spotDistance ?? 0
        tm.totalPrice = productsPrice + plantingFee + spotFee

        const orderText = orderedText(tm.kits)
        const payText = paymentText(productsPrice, plantingFee, spotFee)
        const footerText =
            'Расстояние: 4к = 5 RUB\n' +
            'Доставка на руки: 20% от цены'

        const embed = new EmbedBuilder()
            .setTitle('Оплата')
            .setDescription('Автоматически проверяется, и в случае успеха тебя уведомят')
            .setColor(Colors.Blurple)
            .addFields([
                {name: 'Заказ:', value: orderText},
                {name: 'Оплата:', value: payText},
            ])
            .setFooter({text: footerText})

        const payButton = new ButtonBuilder()
            .setCustomId('ticket-pay')
            .setLabel('Оплатить')
            .setStyle(ButtonStyle.Success)
        const ar = actionRow(payButton)

        reply.reply({embeds: [embed], components: [ar]})

        tm.save()
    }
)
