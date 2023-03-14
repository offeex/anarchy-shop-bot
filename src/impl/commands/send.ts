import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle, Colors,
	SlashCommandBuilder
} from 'discord.js'
import { SlashCommand } from '../../structures/command/SlashCommand'

// TODO: replace with complete embed manager that can do more stuff
export default new SlashCommand(
	new SlashCommandBuilder()
		.setName('send')
		.setDescription('Easy-to-use embed manager')
		.addStringOption(option =>
			option
				.setName('layout')
				.setDescription('Layout name')
				.setRequired(true)
				.addChoices(
					{ name: 'Ticket system', value: 'create-ticket' },
					{ name: 'Assortment', value: 'assortment-kits' }
				)
		),

	async interaction => {
		const layout = interaction.options.getString('layout')

		await interaction.deferReply()
		await interaction.deleteReply()

		switch (layout) {
			case 'create-ticket': {
				const button = new ButtonBuilder()
					.setCustomId('create-ticket')
					.setLabel('🛒 Открыть тикет')
					.setStyle(ButtonStyle.Primary)

				await interaction.channel?.send({
					embeds: [
						{
							title: 'Оформление заказа',
							description:
								'Чтобы открыть тикет, нажми на кнопку ниже под сообщением.' +
								'\nДалее, следуй инструкции, которую бот напишет в тикете',
							color: Colors.Blue,
							footer: { text: 'Желаем удачи и успешных покупок!' },
						},
					],
					components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button)],
				})
				break
			}
			case 'assortment-kits': {
				// TODO: implement
				break
			}
			default: {
				break
			}
		}
	}
)
