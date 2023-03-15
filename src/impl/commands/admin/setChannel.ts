import { SlashCommand } from '../../../structures/command/SlashCommand'
import { ChannelType, SlashCommandBuilder, TextChannel } from 'discord.js'
import { getValue, setIfNotExists, setValue } from '../../../utils/storage.util'

export default new SlashCommand(
	new SlashCommandBuilder()
		.setName('setchannel')
		.setDescription('Set a channel for a specific purpose')
		.addChannelOption(option => option
			.setName('channel')
			.setDescription('The channel to set')
			.addChannelTypes(ChannelType.GuildText)
			.setRequired(true))
		.addStringOption(option => option
			.setName('purpose')
			.setDescription('The purpose of the channel')
			.setRequired(true)
			.addChoices(
				{ name: 'Init', value: 'init' }
			)),
	async (interaction) => {
		const channel = interaction.options.getChannel('channel') as TextChannel | undefined
		if (!channel) return interaction.reply('You must specify a channel')

		const purpose = interaction.options.getString('purpose')
		if (!purpose) return interaction.reply('You must specify a purpose')

		setValue(`channel:${purpose}`, channel.id)
		await interaction.reply(`Channel set to ${channel} for \`${purpose}\``)
	}
)