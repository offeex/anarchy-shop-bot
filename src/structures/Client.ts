import { ButtonStyle, ChannelType, Client, Collection, OverwriteType } from 'discord.js'
import { Command } from './Command'
import Button from './Button'
import { mongoose } from '@typegoose/typegoose'
import { client } from '../index'
import { load } from '../utils/load.util'
import { setupAssortment, setupOrdering } from '../managers/client.manager'

export class ExtendedClient extends Client {
	public readonly commands: Collection<string, Command> = new Collection()
	public readonly buttons: Collection<string, Button> = new Collection()

	constructor() {
		super({ intents: ['Guilds', 'GuildMessages', 'MessageContent'] })
	}

	public async start() {
		load(this)
		this.login(process.env.TOKEN).then(() => console.log('Logged in!'))

		await mongoose.connect(process.env.DATABASE_URL!)
		this.reinit()
	}

	public async reinit() {
		const guild = await client.guilds.fetch(process.env.GUILD_ID!)
		if (!guild) throw new Error('Guild not found')

		await setupAssortment(guild)
		await setupOrdering(guild)
	}
}