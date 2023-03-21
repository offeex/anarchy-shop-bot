import {
	ActionRowBuilder,
	BaseMessageOptions,
	ButtonBuilder,
	ButtonStyle,
	CategoryChannel,
	ChannelType,
	Colors,
	EmbedBuilder,
	Guild,
	TextChannel
} from 'discord.js'
import { getValue, setIfNotExists, setValue } from '../utils/storage.util'
import { atmName, getAtm, sendWithEntry } from '../utils/discord.util'
import { offers } from '../impl/storage'
import { Offer, OfferModel } from '../models/offer.model'
import { Doc, TicketCategoryEntry, TicketCategoryName } from '../utils/types.util'
import { getHexColor, getShulkerIcon } from '../utils/color.util'

async function createOffers() {
	try {
		for (const offer of offers)
			await OfferModel.create({ ...offer })
	} catch (e: any) {
		if (e.__proto__.name != 'MongoServerError' || e.code != 11000)
			throw e
	}
}

async function setupAssortmentCategory(guild: Guild): Promise<CategoryChannel> {
	const categoryChannelId = process.env.ASSORTMENT_CATEGORY_ID
	if (!categoryChannelId) throw new Error('Assortment category ID is not set')
	return await guild.channels.fetch(categoryChannelId, { force: true }) as CategoryChannel
}

function setupOfferPayload(o: Offer): BaseMessageOptions {
	const att = getAtm(getShulkerIcon(o.color), o.color + '.png')
	const embed = new EmbedBuilder()
		.setAuthor({ name: o.name, iconURL: atmName(att) })
		.setColor(getHexColor(o.color))
		.setFields({ name: 'Цена', value: `${o.price} RUB` })
		.setImage(o.imageURL)
		.setThumbnail(atmName(att))
	return { embeds: [embed], files: [att] }
}

export async function setupAssortment(guild: Guild) {
	await createOffers()
	let category = await setupAssortmentCategory(guild)

	const allOffers = await OfferModel.find({ inStock: true }) as Doc<Offer>[]
	const assortmentChannels = new Set(allOffers.map(o => o.category))

	// Creating assortment channels if they don't exist
	let channels: TextChannel[] = []
	for (const c of assortmentChannels)
		if (!category.children.cache.find(chan => chan.name === c))
			channels.push(await category.children.create({
				name: c, type: ChannelType.GuildText
			}))

	// Building and sending embeds
	for (const o of allOffers) {
		const channel = channels.find(chan => chan.name === o.category)
		if (!channel) continue
		channel.send(setupOfferPayload(o))
	}
}

async function setupOrderChannel(guild: Guild): Promise<TextChannel> {
	const channelId = await process.env.ORDER_CHANNEL_ID
	if (!channelId) throw new Error('Order channel is not set up')

	const channel = await guild.channels.fetch(channelId) as TextChannel
	if (channel.type !== ChannelType.GuildText)
		throw new Error('Order channel is not a text channel, it\'s type is: ' + channel.type)
	return channel
}

async function setupOrderPayload(): Promise<BaseMessageOptions> {
	await setIfNotExists('order-instruction', 'Test instruction')
	const ins = await getValue(
		'order-instruction',
		'There is no order instruction set yet'
	) as string
	const embed = new EmbedBuilder()
		.setTitle('Оформить заказ')
		.setDescription('Нажмите на кнопку ниже, чтобы открыть тикет')
		.setColor(Colors.Green)
	const button = new ActionRowBuilder<ButtonBuilder>().setComponents(
		new ButtonBuilder()
			.setCustomId('create-ticket')
			.setLabel('Создать заказ')
			.setStyle(ButtonStyle.Primary)
	)

	return { content: ins, embeds: [embed], components: [button] }
}

export async function setupOrdering(guild: Guild) {
	const channel = await setupOrderChannel(guild)
	await sendWithEntry('order-instruction-id', await setupOrderPayload(), channel)
}

export async function setupTicketCategories(guild: Guild) {
	const categoryNames: TicketCategoryName[] = ['оформление', 'доставка', 'выполнено']
	const categories: TicketCategoryEntry[] = []

	for (const name of categoryNames) {
		let c = guild.channels.cache.find(chan => chan.name === name)
		if (!c) c = await guild.channels.create({ name, type: ChannelType.GuildCategory })
		categories.push({ name, channelId: c.id })
	}

	await setValue('ticket-categories', categories)
}