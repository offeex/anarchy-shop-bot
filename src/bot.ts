import { Client, GatewayIntentBits } from 'discord.js';
import CommandHandler from './handlers/command-handler';
import EventHandler from './handlers/event-handler';

export class Bot {
	public readonly client = new Client({
		intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
	});

	public readonly eventHandler = new EventHandler();
	public readonly commandHandler = new CommandHandler();

	public init(): void {
		// TODO: single manager for all handlers to manage them
		this.eventHandler.init();
		this.commandHandler.init();

		try {
			this.client.login(process.env.CLIENT_TOKEN);
		} catch (error) {
			// TODO: i don't like this way of logging errors (maybe write custom logging util in future?)
			console.error(error);
			process.exit(1);
		}
	}
}
