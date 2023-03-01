import { ButtonInteraction } from 'discord.js';

export default interface Button {
	name: string;

	invoke(interaction: ButtonInteraction, ...args: any[]): Promise<any>;
}
