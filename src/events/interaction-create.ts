import { Events, Interaction, InteractionResponse } from 'discord.js';
import { bot } from '..';
import Event from '../base/event';

export default class extends Event {
  public on = Events.InteractionCreate;

  public async execute(
    interaction: Interaction,
  ): Promise<InteractionResponse | undefined> {
    if (interaction.isChatInputCommand()) {
      const command = bot.commandHandler.commands.get(interaction.commandName);

      if (!command) {
        return await interaction.reply({
          content: 'Invalid command!',
          ephemeral: true,
        });
      }

      try {
        command.execute(interaction);
      } catch (error) {
        console.error(error);
      }
    } else if (interaction.isButton()) {
      const button = bot.buttonHandler.buttons.get(interaction.customId);

      if (!button) {
        return await interaction.reply({
          content: 'Invalid button!',
          ephemeral: true,
        });
      }

      try {
        button.execute(interaction);
      } catch (error) {
        console.error(error);
      }
    }
  }
}
