import { SlashCommand } from '../../../structures/command/SlashCommand'
import { ChannelType, SlashCommandBuilder } from 'discord.js'

export default new SlashCommand(
	new SlashCommandBuilder()
		.setName('setchannel')
		.setDescription('Set a channel for a specific purpose')
		.addChannelOption(option => option
			.setName('channel')
			.setDescription('The channel to set')
			.addChannelTypes(ChannelType.GuildText))
		.addStringOption(option => option
			.setName('purpose')
			.setDescription('The purpose of the channel')
			.addChoices(
				{ name: 'Orders', value: 'orders' },
			)),
	async (interaction) => {
		const channel = interaction.options.getChannel('channel')
		if (!channel) return interaction.reply('You must specify a channel')

		const purpose = interaction.options.getString('purpose')
		if (!purpose) return interaction.reply('You must specify a purpose')

		await interaction.reply(`Channel set to ${channel} for ${purpose}`)
	}
)