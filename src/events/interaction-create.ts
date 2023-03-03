import { Events, Interaction } from 'discord.js';
import { bot } from '..';
import Event from '../interfaces/event';

export default class implements Event {
  public on = Events.InteractionCreate;

  // TODO: consider changing returnable value with InteractionResponse<?> type?
  public async invoke(interaction: Interaction): Promise<any> {
    if (interaction.isChatInputCommand()) {
      const command = bot.commandHandler.commands.get(interaction.commandName);

      if (!command) {
        return await interaction.reply({
          content: 'Invalid command',
          ephemeral: true,
        });
      }

      try {
        command.invoke(interaction);
      } catch (error) {
        console.error(error);
      }
    } else if (interaction.isButton()) {
      const button = bot.buttonHandler.buttons.get(interaction.customId);

      if (!button) {
        return await interaction.reply({
          content: 'Invalid button',
          ephemeral: true,
        });
      }

      try {
        button.invoke(interaction);
      } catch (error) {
        console.error(error);
      }
    }
  }
}
