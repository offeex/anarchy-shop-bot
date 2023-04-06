import { ButtonBuilder, ButtonStyle, DiscordjsError, EmbedBuilder, SlashCommandBuilder, TextChannel } from 'discord.js'
import { SlashCommand } from '../../../structures/command/SlashCommand'
import { getValue } from '../../../utils/storage.util'
import { TicketCategoryEntry } from '../../../utils/types.util'
import { actionRow } from '../../../utils/discord.util'
import { getTicket, saveTicket, ticketStage } from '../../../managers/ticket.manager'

export default new SlashCommand(
	new SlashCommandBuilder()
		.setName('delivery')
		.setDescription('Marks delivery process as started')
		.addStringOption(o => o
			.setName('stage')
			.setDescription('Stage of delivery')
			.setRequired(true)
			.setChoices({ name: 'start', value: 'start' }, { name: 'end', value: 'end' })
		),
	async interaction => {
		const t = getTicket(interaction)
		if (!t)
			return interaction.reply({
				content: 'Тикет не найден или канал иссуе',
				ephemeral: true
			})

		const stage = interaction.options.getString('stage') as 'start' | 'end'
		let embed: EmbedBuilder = new EmbedBuilder()

		if (t.category === 'done')
			return interaction.reply({ content: 'Заказ уже завершен', ephemeral: true })

		if (stage === 'start') {
			const coords = `**${t.spot.x} ${t.spot.z}**`
			const desc =
				`Ожидайте курьера на месте получения заказа: ${coords}\n` + 'Не выходите из игры!'
			embed.setTitle('Курьер вылетел со стеша!').setDescription(desc).setColor('Orange')

			await interaction.reply({ embeds: [embed] })

		} else if (stage === 'end') {
			const reviews = await interaction.guild!.channels.fetch(process.env.REVIEW_CHANNEL_ID!)
			const desc =
				`Благодарим за покупку, оставь отзыв!\n` + `Он автоматом дублируется ботом в ${reviews}`
			embed.setTitle('Заказ доставлен!').setDescription(desc).setColor('Green')
			embed.setFooter({ text: 'Тикет будет удалён через: 30 минут' })
			const reviewButton = new ButtonBuilder()
				.setCustomId('review')
				.setLabel('Оставить отзыв')
				.setStyle(ButtonStyle.Success)

			const ts = ticketStage(t)
			ts.review = await (
				await interaction.reply({
					embeds: [embed],
					components: [actionRow(reviewButton)]
				})
			).fetch()

			t.category = 'done'
			await saveTicket(t)

			const category = (await getValue('ticket-categories')) as TicketCategoryEntry[]
			await (interaction.channel as TextChannel).setParent(
				category.find(c => c.name === 'выполнено')!.channelId
			)

			setTimeout(() => {
				interaction.channel!.delete().catch((err: DiscordjsError) => {
					console.error('Processed ticket deletion error: ', err.message)
				})
			}, 1000 * parseInt(process.env.DONE_STAGE_TIMEOUT ?? '60'))
		}
	}
)