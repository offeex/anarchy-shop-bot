import Button from '../../../structures/Button'
import { SpotType } from '../../../utils/types.util'
import { ButtonBuilder, ButtonStyle, Colors, ComponentType, EmbedBuilder, TextChannel } from "discord.js";
import { getTicket, parseCustomSpot, ticketFee, ticketStage } from '../../../managers/ticket.manager'
import { randomVec2 } from '../../../utils/number.util'
import { actionRow, resolveInteractionUpdate, toggleComponents } from '../../../utils/discord.util'
import { offers } from '../../../managers/offer.manager'
import { orderedText, paymentText } from '../../../utils/text.util'
import destr from "destr";
import { client } from "../../../index";

export default new Button(
	['ticket-spot-pick', 'ticket-spot-generate'],
	async interaction => {
		const isInteractionNew = await resolveInteractionUpdate(interaction)

		const t = await getTicket(interaction)
		const ts = ticketStage(t)
		const msg = ts.spot
		let spotType = isInteractionNew
			? (interaction.customId.split('-')[2] as SpotType)
			: 'pick'

		await toggleComponents(msg, true)

		if (spotType === 'pick') {
			const chan = (await interaction.channel) as TextChannel
			const cont = `Введи координаты в таком формате: -100 100, где первое число х, а второе z соответственно`
			const { x, z } = await parseCustomSpot(chan, cont, [])
			const distance = Math.hypot(x, z)
			ticketFee(t).spot = distance > 40000 ? distance * 0.00125 : 0
			t.spot = { x, z: z }
		} else if (spotType === 'generate')
			t.spot = randomVec2({ x: -16000, z: -16000 }, { x: 16000, z: 16000 })

		const spotReply = await msg.reply(
			`Место назначения выбрано: **${t.spot.x} ${t.spot.z}**`
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
			.setColor('Blurple')
			.addFields([
				{ name: 'Заказ:', value: orderText },
				{ name: 'Оплата:', value: payText }
			])
			.setFooter({ text: footerText })

		const payButton = new ButtonBuilder()
			.setCustomId('ticket-payment')
			.setLabel('Я оплатил')
			.setStyle(ButtonStyle.Success)
		const ar = actionRow(payButton)

		ts.payment = await spotReply.reply({ embeds: [embed], components: [ar] })
		const paymentInteraction = await ts.payment.awaitMessageComponent({
			filter: i => i.user.id === interaction.user.id,
			componentType: ComponentType.Button
		})

		// for manual payment check
		await paymentInteraction.reply(
			'На данный момент оплата проверяется вручную.\n' +
			'Мы тебя уведомим, когда оплата будет проверена'
		)
		for (const s of destr(process.env.SELLERS_IDS) as string[]) {
			const msg = `Заказчик предположил оплату: ${interaction.channel}`
			await client.users.send(s, msg)
		}
	}
)
