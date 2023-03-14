import {
	CategoryChannel,
	ChannelType,
	Client,
	ClientEvents,
	Collection,
	EmbedBuilder,
	OverwriteType,
	PermissionsBitField,
	TextChannel
} from 'discord.js'
import { globSync } from 'glob'
import { Event } from './Event'
import { Command } from './Command'
import Button from './Button'
import { mongoose } from '@typegoose/typegoose'
import { initStorage } from '../impl/storage'
import { Offer, OfferModel } from '../models/offer.model'
import { Doc } from '../utils/types.util'
import { client } from '../index'
import { attName, getAtt } from '../utils/discord.util'
import { getHexColor, getShulkerIcon } from '../utils/color.util'

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

		await mongoose.connect(process.env.DATABASE_URL!)
		this.setupAssortment()
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

	private async setupAssortment() {
		await initStorage()

		const guild = await client.guilds.fetch(process.env.GUILD_ID!)
		if (!guild) throw new Error('Guild not found')

		let category = guild.channels.cache.find(c =>
			c.name === 'Ассортимент' && c.type === ChannelType.GuildCategory
		) as CategoryChannel

		if (!category) {
			category = await guild.channels.create({
				name: 'Ассортимент',
				type: ChannelType.GuildCategory,
				permissionOverwrites: [{
					allow: PermissionsBitField.Flags.ViewChannel,
					deny: PermissionsBitField.Flags.SendMessages,
					id: guild.roles.everyone
					// type: OverwriteType.Role
				}]
			})
		}

		const offers = await OfferModel.find() as Doc<Offer>[]
		const categories = new Set(offers.map(o => o.category))
		let channels: TextChannel[] = []

		for (const c of categories)
			if (!category.children.cache.find(chan => chan.name === c))
			channels.push(await category.children.create({
			name: c, type: ChannelType.GuildText
		}))

		for (const o of offers) {
			const channel = channels.find(chan => chan.name === o.category)
			if (!channel) continue

			const att = getAtt(getShulkerIcon(o.color), o.color + '.png')
			const embed = new EmbedBuilder()
				.setAuthor({ name: o.name, iconURL: attName(att) })
				.setColor(getHexColor(o.color))
				.setFields({ name: 'Цена', value: `${o.price} RUB` })
				.setImage(o.imageURL)
				.setThumbnail(attName(att))

			 channel.send({ embeds: [embed], files: [att] })
		}
	}
}