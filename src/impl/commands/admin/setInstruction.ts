import { SlashCommand } from '../../../structures/command/SlashCommand'
import { ChannelType, SlashCommandBuilder } from 'discord.js'
import { setValue } from '../../../utils/storage.util'

export default new SlashCommand(
	new SlashCommandBuilder()
		.setName('set-instruction')
		.setDescription('Sets the instruction for a user')
		.addStringOption(option => option
			.setName('purpose')
			.setDescription('The purpose of the instruction')
			.setRequired(true)
			.addChoices(
				{ name: 'Init', value: 'init' }
			)),
	async (interaction) => {
		const purpose = interaction.options.getString('purpose')
		if (!purpose) return interaction.reply('You must specify a purpose')

		await interaction.reply('Now send the instruction')

		const instruction = (await interaction.channel?.awaitMessages({
			filter: m => m.author.id === interaction.user.id, max: 1, time: 30000
		}))?.first()?.content
		if (!instruction)
			return interaction.followUp('You did not send an instruction in time')

		await setValue(`instruction:${purpose}`, instruction)
		await interaction.followUp('Instruction set successfully')
	}
)