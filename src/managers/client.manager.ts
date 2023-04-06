import {
	BaseMessageOptions,
	ButtonBuilder,
	ButtonStyle,
	CategoryChannel,
	ChannelType,
	Colors, DiscordjsError,
	EmbedBuilder,
	Guild,
	TextChannel
} from 'discord.js'
import { getValue, setIfNotExists, setValue } from '../utils/storage.util'
import { actionRow, sendIfNotExists } from '../utils/discord.util'
import { Offer, OfferModel } from '../models/offer.model'
import {
	Doc,
	InstructionEntry,
	TicketCategoryEntry,
	TicketStageName,
} from '../utils/types.util'
import { createOffers, offers, setupOfferPayload } from './offer.manager'
import { client } from '../index'

export let instructionEntries: InstructionEntry[] = []

async function updateInstructions() {
	return await setValue('instructions', instructionEntries)
}

async function setupAssortmentCategory(guild: Guild): Promise<CategoryChannel> {
	const categoryChannelId = process.env.ASSORTMENT_CATEGORY_ID
	if (!categoryChannelId) throw new Error('Assortment category ID is not set')
	const chan = await guild.channels.fetch(categoryChannelId)
	if (!chan) throw new Error('Assortment category is not found')
	return chan as CategoryChannel
}

export async function setupAssortment(guild: Guild) {
	await createOffers()
	let category = await setupAssortmentCategory(guild)

	offers.length = 0
	offers.push(...(await OfferModel.find({ inStock: true }) as Doc<Offer>[]))
	const assortmentChannels = new Set(offers.map(o => o.category))

	console.log('Offers: ', offers)
	console.log('all text channels: ', Array.of(category.children.cache.values()))
	// Creating assortment channels if they don't exist
	let channels: TextChannel[] = []
	for (const c of assortmentChannels)
		if (!category.children.cache.find(chan => chan.name === c))
			channels.push(await category.children.create({ name: c, type: ChannelType.GuildText }))

	console.log('Channels created: ', channels)
	// Building and sending embeds
	for (const o of offers) {
		const channel = channels.find(chan => chan.name === o.category)
		if (!channel) continue
		await channel.send(setupOfferPayload(o))
	}
}

export async function setupInstructions() {
	const template: InstructionEntry[] = [
		{ name: 'order', value: 'Troll moment, no instruction!' },
		{ name: 'delivery', value: 'Delivery instruction is fuckin missin\'' }
	]
	await setIfNotExists('instructions', template)
	instructionEntries = (await getValue('instructions')) as InstructionEntry[]
}

async function setupOrderChannel(guild: Guild): Promise<TextChannel> {
	const channelId = await process.env.ORDER_CHANNEL_ID
	if (!channelId) throw new Error('Order channel is not set up')

	const channel = await guild.channels.fetch(channelId) as TextChannel
	if (channel.type !== ChannelType.GuildText)
		throw new Error('Order channel is not a text channel, it\'s type is: ' + channel.type)
	return channel
}

function setupOrderPayload(content: string): BaseMessageOptions {
	const embed = new EmbedBuilder()
		.setTitle('Оформить заказ')
		.setDescription('Нажмите на кнопку ниже, чтобы открыть тикет')
		.setColor('Green')
	const ar = actionRow(new ButtonBuilder()
		.setCustomId('create-ticket')
		.setLabel('Создать заказ')
		.setStyle(ButtonStyle.Primary)
	)
	return { content, embeds: [embed], components: [ar] }
}

export async function setupOrdering(guild: Guild) {
	const chan = await setupOrderChannel(guild)
	const entry = instructionEntries.find(i => i.name === 'order')
	if (!entry) throw new Error('Order instruction entry is not found')

	const payload = setupOrderPayload(entry.value)

	entry.channelId = chan.id
	entry.msgId = await sendIfNotExists(payload, entry.msgId, chan)
	await updateInstructions()
}

export async function setupTicketCategories(guild: Guild) {
	const categoryNames: TicketStageName[] = ['оформление', 'доставка', 'выполнено']
	const categories: TicketCategoryEntry[] = []

	for (const name of categoryNames) {
		let c = guild.channels.cache.find(chan => chan.name === name)
		if (!c) c = await guild.channels.create({ name, type: ChannelType.GuildCategory })
		categories.push({ name, channelId: c.id })
	}

	await setValue('ticket-categories', categories)
}

export async function invalidateTickets(guild: Guild) {
	const categories = await getValue('ticket-categories') as TicketCategoryEntry[]
	const unpaidCategoryId = categories.find(c => c.name === 'оформление')!.channelId
	const category = await guild.channels.fetch(unpaidCategoryId) as CategoryChannel
	const channels = category.children.cache
	for (const chan of channels.values()) {
		if (chan.type !== ChannelType.GuildText) continue
		// error may arise
		await client.users.send(
			chan.topic!,
			'Данные стали невалидны из-за перезагрузки бота, открой тикет заново'
		)
		await chan.delete('fuck').catch((err: DiscordjsError) => {
			console.error("Ticket invalidation moment: ", err.message)
		})
	}
}