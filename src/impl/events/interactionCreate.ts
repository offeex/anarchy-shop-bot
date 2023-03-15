import { client as client } from '../../index'
import { Event } from '../../structures/Event'

export default new Event('interactionCreate', async interaction => {
	if (interaction.isCommand()) {
		const command = client.commands.get(interaction.commandName)

		if (!command)
			return await interaction.reply({
				content: 'Invalid command!',
				ephemeral: true
			})

		command.execute(interaction, client)
	} else if (interaction.isButton()) {
		const button = client.buttons.get(interaction.customId)

		if (!button) {
      console.error('Button not found, button customId:', interaction.customId)
      return await interaction.deferUpdate()
    }

		button.execute(interaction, client)
	}
})