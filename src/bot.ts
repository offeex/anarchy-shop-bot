import { Client, GatewayIntentBits } from 'discord.js'
import ButtonHandler from './handlers/button-handler'
import CommandHandler from './handlers/command-handler'
import EventHandler from './handlers/event-handler'

export class Bot {
	public readonly client = new Client({
		intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
	})

	public readonly eventHandler = new EventHandler()
	public readonly commandHandler = new CommandHandler()
	public readonly buttonHandler = new ButtonHandler()

	public async init(): Promise<void> {
		// TODO: single manager for all handlers to manage them
		await this.eventHandler.init()
		await this.commandHandler.init()
		await this.buttonHandler.init()

		try {
			await this.client.login(process.env.CLIENT_TOKEN)
		} catch (error) {
			// TODO: i don't like this way of logging errors (maybe write custom logging util in future?)
			console.error(error)
			process.exit(1)
		}
	}
}
