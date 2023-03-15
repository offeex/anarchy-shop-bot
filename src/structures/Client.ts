import {
	CategoryChannel,
	ChannelType,
	Client,
	ClientEvents,
	Collection,
	EmbedBuilder,
	Guild,
	OverwriteType,
	PermissionsBitField,
	TextChannel
} from 'discord.js'
import { globSync } from 'glob'
import { Event } from './Event'
import { Command } from './Command'
import Button from './Button'
import { mongoose } from '@typegoose/typegoose'
import { Offer, OfferModel } from '../models/offer.model'
import { Doc } from '../utils/types.util'
import { client } from '../index'
import { attName, getAtt } from '../utils/discord.util'
import { getHexColor, getShulkerIcon } from '../utils/color.util'
import { offers } from '../impl/storage'
import { getValue, setValue } from '../utils/storage.util'

export class ExtendedClient extends Client {
	public readonly commands: Collection<string, Command> = new Collection()
	public readonly buttons: Collection<string, Button> = new Collection()

	constructor() {
		super({ intents: ['Guilds', 'GuildMessages', 'MessageContent'] })
	}

	public async start() {
		this.loadEvents()
		this.loadCommands()
		this.loadButtons()
		this.login(process.env.TOKEN).then(() => console.log('Logged in!'))

		await mongoose.connect(process.env.DATABASE_URL!)
		this.reinit()
	}

	private loadEvents() {
		const files = globSync(`${__dirname}/../impl/events/*.ts`)
		for (const path of files) {
			const { event, execute }: Event<keyof ClientEvents> = require(path).default
			this.on(event, execute)
		}
	}

	private loadCommands() {
		const files = globSync(`${__dirname}/../impl/commands/**/*.ts`)
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

	public async reinit() {
		const guild = await client.guilds.fetch(process.env.GUILD_ID!)
		if (!guild) throw new Error('Guild not found')

		await this.setupAssortment(guild)
		await this.checkOrderChannel(guild)
	}

	private async checkOrderChannel(guild: Guild) {
		const channelId: string = await getValue('channel:init')
		if (!channelId) {
			console.log('Order channel is not set up')
			return
		}

		try {
			await guild.channels.fetch(channelId)
		} catch (e) {
			console.error('Order channel not found', e)
		}
	}

	private async setupAssortment(guild: Guild) {
		try {
			for (const offer of offers) await OfferModel.create({ ...offer })
		} catch (e: any) {
			if (e.__proto__.name != 'MongoServerError' || e.code != 11000)
				throw e
		}

		const categoryChannelId: string = await getValue('channel:category')
		let category: CategoryChannel | undefined

		if (categoryChannelId)
			category = await guild.channels.fetch(categoryChannelId) as CategoryChannel

		if (!category) {
			category = await guild.channels.create({
				name: 'Ассортимент',
				type: ChannelType.GuildCategory,
				permissionOverwrites: [{
					allow: PermissionsBitField.Flags.ViewChannel,
					deny: PermissionsBitField.Flags.SendMessages,
					id: guild.roles.everyone
				}]
			})
			await setValue('channel:category', category.id)
		}

		const allOffers = await OfferModel.find({ inStock: true }) as Doc<Offer>[]
		const categories = new Set(allOffers.map(o => o.category))
		let channels: TextChannel[] = []

		for (const c of categories)
			if (!category.children.cache.find(chan => chan.name === c))
				channels.push(await category.children.create({
					name: c, type: ChannelType.GuildText
				}))

		for (const o of allOffers) {
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