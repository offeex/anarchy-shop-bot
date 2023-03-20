import { globSync } from 'glob'
import { Event } from '../structures/Event'
import { ClientEvents, Collection } from 'discord.js'
import { Command } from '../structures/Command'
import Button from '../structures/Button'
import { ExtendedClient } from '../structures/Client'

function getFiles(folder: string) {
	return globSync(`${__dirname}/../impl/${folder}/**/*.ts`)
}

function loadEvents(client: ExtendedClient) {
	for (const file of getFiles('events')) {
		const { event, execute }: Event<keyof ClientEvents> = require(file).default
		client.on(event, execute)
	}
}

function loadCommands(map: Collection<string, Command>) {
	for (const file of getFiles('commands')) {
		const command: Command = require(file).default
		if (!command) continue
		map.set(command.data.name, command)
	}
}

function loadButtons(map: Collection<string, Button>) {
	for (const file of getFiles('buttons')) {
		const button: Button = require(file).default
		if (!button) continue
		map.set(button.customId, button)
	}
}

export function load(client: ExtendedClient) {
	loadEvents(client)
	loadCommands(client.commands)
	loadButtons(client.buttons)
}