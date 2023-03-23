import {
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
import { actionRow, sendWithEntry } from '../utils/discord.util'
import { Offer, OfferModel } from '../models/offer.model'
import { Doc, TicketCategoryEntry, TicketCategoryName } from '../utils/types.util'
import { createOffers, offers, setupOfferPayload } from './offer.manager'

async function setupAssortmentCategory(guild: Guild): Promise<CategoryChannel> {
    const categoryChannelId = process.env.ASSORTMENT_CATEGORY_ID
    if (!categoryChannelId) throw new Error('Assortment category ID is not set')
    return (await guild.channels.fetch(categoryChannelId, {
        force: true,
    })) as CategoryChannel
}

export async function setupAssortment(guild: Guild) {
    await createOffers()
    let category = await setupAssortmentCategory(guild)

    offers.length = 0
    offers.push(...(await OfferModel.find({inStock: true}) as Doc<Offer>[]))
    const assortmentChannels = new Set(offers.map(o => o.category))

    // Creating assortment channels if they don't exist
    let channels: TextChannel[] = []
    for (const c of assortmentChannels)
        if (!category.children.cache.find(chan => chan.name === c))
            channels.push(await category.children.create({
                name: c, type: ChannelType.GuildText
            }))

    // Building and sending embeds
    for (const o of offers) {
        const channel = channels.find(chan => chan.name === o.category)
        if (!channel) continue
        await channel.send(setupOfferPayload(o))
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
    const ar = actionRow(new ButtonBuilder()
        .setCustomId('create-ticket')
        .setLabel('Создать заказ')
        .setStyle(ButtonStyle.Primary)
    )

    return {content: ins, embeds: [embed], components: [ar]}
}

export async function setupOrdering(guild: Guild) {
	const channel = await setupOrderChannel(guild)
	await sendWithEntry(await setupOrderPayload(), channel)
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