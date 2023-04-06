import { SlashCommand } from '../../../structures/command/SlashCommand'
import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { client } from '../../../index'

export default new SlashCommand(
	new SlashCommandBuilder()
		.setName('reinit')
		.setDescription('Reinitialize the bot')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async (interaction) => {
		await interaction.reply('Reinitializing...')
		await client.reinit()
		await interaction.editReply('Reinitialized successfully')
	}
)