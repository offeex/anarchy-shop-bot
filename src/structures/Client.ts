import { Client, ClientEvents, Collection } from 'discord.js'
import { globSync } from 'glob'
import { Event } from './Event'
import { Command } from './Command'
import Button from './Button'

export class ExtendedClient extends Client {
    public readonly commands: Collection<string, Command> = new Collection()
    public readonly buttons: Collection<string, Button> = new Collection()

    constructor() {
        super({ intents: ['Guilds', 'GuildMessages'] })
    }

    public async start() {
        this.loadEvents()
        this.loadCommands()
        this.loadButtons()
        this.login(process.env.TOKEN).then(() => console.log('Logged in!'))
    }

    private loadEvents() {
        const files = globSync(`${__dirname}/../events/*.ts`)
        for (const path of files) {
            const { event, execute }: Event<keyof ClientEvents> = require(path).default
            this.on(event, execute)
        }
    }

    private loadCommands() {
        const files = globSync(`${__dirname}/../commands/*/*.ts`)
        for (const path of files) {
            const command: Command = require(path).default
            if (!command) continue
            this.commands.set(command.data.name, command)
        }
    }

    private loadButtons() {
        const files = globSync(`${__dirname}/../buttons/*.ts`)
        for (const path of files) {
            const button: Button = require(path).default
            if (!button) continue
            this.buttons.set(button.name, button)
        }
    }
}