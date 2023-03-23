import Button from '../../../structures/Button'
import { SpotType } from '../../../utils/types.util'
import { ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, TextChannel } from 'discord.js'
import { getTicket, parseCustomSpot, ticketFee, ticketStage } from '../../../managers/ticket.manager'
import { randomVec2 } from '../../../utils/number.util'
import { actionRow, resolveInteractionUpdate, toggleComponents } from '../../../utils/discord.util'
import { offers } from '../../../managers/offer.manager'
import { orderedText, paymentText } from '../../../utils/text.util'

export default new Button(
	['ticket-spot-pick', 'ticket-spot-generate'],
	async interaction => {
		const isInteractionNew = await resolveInteractionUpdate(interaction)

		const t = await getTicket(interaction)
		const msg = ticketStage(t).spot!
		let spotType = isInteractionNew
			? (interaction.customId.split('-')[2] as SpotType)
			: 'pick'

		await toggleComponents(msg, true)

		if (spotType === 'pick') {
			const chan = (await interaction.channel) as TextChannel
			const cont = `Введи координаты в таком формате: -100 100, где первое число х, а второе z соответственно`
			const { x, y } = await parseCustomSpot(chan, cont, [])
			const distance = Math.hypot(x, y)
			ticketFee(t).spot = distance > 40000 ? distance * 0.00125 : 0
			t.spot = { x, y }
		} else if (spotType === 'generate')
			t.spot = randomVec2({ x: -16000, y: -16000 }, { x: 16000, y: 16000 })

		const spotReply = await msg.reply(
			`Место назначения выбрано: **${t.spot!.x} ${t.spot!.y}**`
		)

		// preparing ticket-payment
		const productsPrice = t.kits
			.map(kit => kit.amount * offers.find(o => o.name === kit.name)!.price)
			.reduce((a, b) => a + b)
		const plantingFee = productsPrice * 0.25
		const spotFee = ticketFee(t).spot
		ticketFee(t).planting = plantingFee
		t.totalPrice = productsPrice + plantingFee + spotFee

		const orderText = orderedText(t.kits)
		const payText = paymentText(productsPrice, plantingFee, spotFee)
		const footerText =
			'Расстояние: 4к = 5 RUB\n' +
			'Доставка на руки: 20% от цены'

		const embed = new EmbedBuilder()
			.setTitle('Оплата')
			.setDescription('Автоматически проверяется, и в случае успеха тебя уведомят')
			.setColor(Colors.Blurple)
			.addFields([
				{ name: 'Заказ:', value: orderText },
				{ name: 'Оплата:', value: payText }
			])
			.setFooter({ text: footerText })

		const payButton = new ButtonBuilder()
			.setCustomId('ticket-payment')
			.setLabel('Оплатить')
			.setStyle(ButtonStyle.Success)
		const ar = actionRow(payButton)

		ticketStage(t).payment = await spotReply.reply({ embeds: [embed], components: [ar] })
	}
)
