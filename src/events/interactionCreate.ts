import { client as c } from '../index'
import { Event } from '../structures/Event'

export default new Event('interactionCreate', async interaction => {
  if (interaction.isCommand()) {
    const command = c.commands.get(interaction.commandName)

    if (!command)
      return await interaction.reply({
        content: 'Invalid command!',
        ephemeral: true,
      })

    command.execute(interaction, c)
  } else if (interaction.isButton()) {
    const button = c.buttons.get(interaction.customId)

    if (!button)
      return await interaction.reply({
        content: 'Invalid button!',
        ephemeral: true,
      })

      button.execute(interaction, c)
  }
})