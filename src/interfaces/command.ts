import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export default interface Command {
	data:
		| SlashCommandBuilder
		| Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

	invoke(
		interaction: ChatInputCommandInteraction,
		...args: any[]
	): Promise<any> | void;
}
