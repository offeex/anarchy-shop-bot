import { SlashCommand } from '../../../structures/command/SlashCommand'
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	Colors,
	EmbedBuilder,
	MessageCreateOptions,
	SlashCommandBuilder,
	TextChannel
} from 'discord.js'
import { getValue } from '../../../utils/storage.util'

export default new SlashCommand(
	new SlashCommandBuilder()
		.setName('send')
		.setDescription('Sets any pointer for a purpose')
		.addStringOption(option => option
			.setName('pointer')
			.setDescription('A pointer to work with')
			.setRequired(true)
			.addChoices(
				{ name: 'Instruction', value: 'instruction' },
				{ name: 'Ticket', value: 'ticket' }
			))
		.addStringOption(option => option
			.setName('purpose')
			.setDescription('The purpose of the pointer')
			.setRequired(true)
			.addChoices(
				{ name: 'Init', value: 'init' }
			)),
	async (interaction) => {
		const pointer = interaction.options.getString('pointer') as 'instruction' | 'ticket' | undefined
		if (!pointer) return interaction.reply('You must specify a pointer')

		const purpose = interaction.options.getString('purpose') as 'init' | undefined
		if (!purpose) return interaction.reply('You must specify a purpose')

		const channelId: string = await getValue(`channel:${purpose}`)
		if (!channelId)
			return await interaction.reply(`There is no channel set for \`${purpose}\` yet. Please set one with \`/setchannel\` first.`)

		const channel = await interaction.guild?.channels.fetch(channelId) as TextChannel | undefined
		if (!channel)
			return await interaction.reply(`Invalid channel set for \`${purpose}\`. Please set a new one with \`/setchannel\`.`)

		let payload: MessageCreateOptions = {}
		switch (pointer) {
			case 'instruction': {
				const action: string = await getValue(`${pointer}:${purpose}`)
				if (!action)
					return await interaction.reply(`There is no ${pointer} set for \`${purpose}\` yet. Please set one with \`/set${pointer}\` first.`)
				payload = { content: action }
				break
			}
			case 'ticket': {
				const embed = new EmbedBuilder()
					.setTitle('Оформить заказ')
					.setDescription('Нажмите на кнопку ниже, чтобы открыть тикет')
					.setColor(Colors.Green)
				const button = new ButtonBuilder()
					.setCustomId('create-ticket')
					.setLabel('Создать заказ')
					.setStyle(ButtonStyle.Primary)
				const ar = new ActionRowBuilder<ButtonBuilder>()
					.setComponents(button)
				payload = { embeds: [embed], components: [ar] }
				break
			}
		}

		await channel.send(payload)
		await interaction.reply(`${pointer} executed on ${purpose} successfully`)
	}
)