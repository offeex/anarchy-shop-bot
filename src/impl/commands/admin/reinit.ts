import { SlashCommand } from '../../../structures/command/SlashCommand'
import { ChannelType, SlashCommandBuilder } from 'discord.js'

export default new SlashCommand(
	new SlashCommandBuilder()
		.setName('reinit')
		.setDescription('Reinitialize the bot'),
	async (interaction) =>
		await interaction.reply('Reinitializing...')
)