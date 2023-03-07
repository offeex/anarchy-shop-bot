import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export default abstract class Command {
  public abstract data:
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

  public abstract execute(
    interaction: ChatInputCommandInteraction,
    ...args: any[]
  ): Promise<any> | any;
}
