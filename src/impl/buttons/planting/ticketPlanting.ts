import Button from '../../../structures/Button'
import { getTicket, ticketStage } from '../../../managers/ticket.manager'
import {
	ButtonBuilder,
	ButtonStyle,
	Colors,
	ComponentType,
	EmbedBuilder,
	MessageActionRowComponentBuilder
} from 'discord.js'
import { PlantingType } from '../../../utils/types.util'
import {
	actionRow,
	resolveInteractionUpdate,
	toggleActionRowBuilder,
	toggleComponents
} from '../../../utils/discord.util'
import { client } from '../../../index'

export default new Button(
	['ticket-planting-plant', 'ticket-planting-handover'],
	async interaction => {
		const isNewInteraction = await resolveInteractionUpdate(interaction)

		const t = await getTicket(interaction)
		t.planting = isNewInteraction
			? (interaction.customId.split('-')[2] as PlantingType)
			: 'plant'
		const ts = ticketStage(t)

		if (!ts.planting) return interaction.channel!!.send('Ну всё ребятки всем спасбио за просмотр')
		const msg = await toggleComponents(ts.planting, true)

		const plantingReply = await msg.reply(
			`Способ доставки выбран: **${t.planting === 'plant' ? 'Кладом' : 'На руки'}**`
		)

		// preparing ticket-spot
		const embed = new EmbedBuilder()
			.setTitle('Место назначения')
			.setColor('DarkVividPink')
			.addFields([
				{
					name: 'Выбрать место',
					value:
						'Выберите место, куда будет доставлен заказ. До 40к по обычному миру - бесплатно'
				},
				{
					name: 'Сгенерировать',
					value:
						'Автоматически генерирует конечную точку заказа, до 16к по обычному миру'
				}
			])
		const pickButton = new ButtonBuilder()
			.setCustomId('ticket-spot-pick')
			.setLabel('Выбрать локацию')
			.setStyle(ButtonStyle.Primary)
		const generateButton = new ButtonBuilder()
			.setCustomId('ticket-spot-generate')
			.setLabel('Сгенерировать')
			.setStyle(ButtonStyle.Secondary)
		const spotAr = actionRow(pickButton)

		if (t.planting == 'handover') {
			toggleActionRowBuilder(spotAr, true)
		} else spotAr.addComponents(generateButton)

		ts.spot = await plantingReply.reply({ embeds: [embed], components: [spotAr] })

		if (t.planting === 'handover')
			await client.buttons.get('ticket-spot-pick')!.execute(interaction)
	}
)
