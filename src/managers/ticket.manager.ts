import { Doc, TicketCategoryEntry, TicketFees, TicketStages, Vec2 } from '../utils/types.util'
import { StagesEntry, Ticket, TicketModel } from '../models/ticket.model'
import {
	APISelectMenuOption,
	BaseMessageOptions,
	ButtonBuilder,
	ButtonInteraction,
	ButtonStyle,
	CategoryChannel,
	ChannelType,
	CommandInteraction,
	ComponentType,
	EmbedBuilder,
	Guild,
	Interaction,
	Message,
	StringSelectMenuBuilder,
	TextBasedChannel,
	TextChannel
} from 'discord.js'
import { clamp, parseVec2 } from '../utils/number.util'
import { actionRow, toggleComponents } from '../utils/discord.util'
import { offers } from './offer.manager'
import { getValue } from '../utils/storage.util'

// Key is a channel id
export let activeTickets = new Array<Ticket>()
export let ticketFees = new Map<string, TicketFees>()
export let ticketStages = new Map<string, TicketStages>()

export function ticketStage(t: Ticket): TicketStages {
	return ticketStages.get(t.channelId)!
}

export function ticketFee(t: Ticket): TicketFees {
	return ticketFees.get(t.channelId)!
}

export function getTicketContent(t: Ticket): string {
	let content = `Выбрано:\n`
	for (const kit of t.kits) content += `- ${kit.name}, ${kit.amount}x\n` // - Кит для выживания, 54x
	return content
}

export function getTicket(i: Interaction): Ticket {
	return activeTickets.find(t => t.channelId === i.channel!.id)!
}

export async function loadTickets(guild: Guild) {
	activeTickets = await TicketModel.find({ category: 'delivery' })

	for (const t of activeTickets) {
		// cache warning
		const chan = guild.channels.cache.get(t.channelId) as TextChannel
		if (!chan) continue

		const ts = t.stages
		const ms = chan.messages

		const delivery = ts.deliveryId ? await ms.fetch(ts.deliveryId) : undefined
		const review = ts.reviewId ? await ms.fetch(ts.reviewId) : undefined

		ticketStages.set(t.channelId, {
			create: await ms.fetch(ts.createId),
			planting: await ms.fetch(ts.plantingId),
			spot: await ms.fetch(ts.spotId),
			payment: await ms.fetch(ts.paymentId),
			delivery,
			review
		})
	}
}

export async function saveTicket(t: Ticket) {
	return TicketModel.findOneAndUpdate(
		{ channelId: t.channelId }, t, { upsert: true, new: true }
	)
}

export function storeStagesInTicket(t: Ticket, ts: TicketStages) {
	t.stages = {
		createId: ts.create.id,
		plantingId: ts.planting.id,
		spotId: ts.spot.id,
		paymentId: ts.payment.id,
		deliveryId: ts.delivery?.id,
		reviewId: ts.review?.id,
	}
}

export function createChooseKitMenus(tc: TextBasedChannel, t: Ticket): BaseMessageOptions {
	const kitsSelectMenu = new StringSelectMenuBuilder()
		.setCustomId('ticket-select-kit')
		.setPlaceholder('Выберите кит')
	for (const o of offers)
		kitsSelectMenu.addOptions({ label: o.name, value: o.name })

	const amountSelectMenu = new StringSelectMenuBuilder()
		.setCustomId('ticket-select-amount')
		.setPlaceholder('Выберите количество')
		.setOptions([
			{ label: '1 шалкер', value: '1' },
			{ label: '27 шалкеров (Пол даба)', value: '27' },
			{ label: '54 шалкера (Даб)', value: '54' },
			{
				label: 'Своё количество',
				value: '-1',
				description: 'Введите своё количество в чат'
			}
		])

	return {
		content: getTicketContent(t),
		components: [actionRow(kitsSelectMenu), actionRow(amountSelectMenu)]
	}
}

async function parseCustomKitsAmount(amount: number, chan: TextChannel, content: string, msgTray: Message[]): Promise<number> {
	const msg = await chan.send(content)
	const res = (await chan.awaitMessages({ max: 1 })).first()!
	msgTray.push(msg, res)
	amount = parseInt(res.content as string)
	if (isNaN(amount)) {
		return await parseCustomKitsAmount(
			amount,
			chan,
			'Неверное количество, введи число',
			msgTray
		)
	}
	await chan.bulkDelete(msgTray)
	return amount
}

export async function parseCustomSpot(chan: TextChannel, content: string, msgTray: Message[]): Promise<Vec2> {
	const msg = await chan.send(content)
	const res = (await chan.awaitMessages({ max: 1 })).first()!
	msgTray.push(msg, res)
	const spot = parseVec2(res.content)
	if (spot == null) {
		return await parseCustomSpot(chan, 'Неверное количество, введи число', msgTray)
	}
	await chan.bulkDelete(msgTray)
	return spot
}

export async function handleChooseKitMenus(msg: Message, t: Ticket) {
	let name: string = '', amount: number = 0

	await msg.createMessageComponentCollector({
		filter: i =>
			i.customId === 'ticket-select-kit' || i.customId === 'ticket-select-amount',
		componentType: ComponentType.SelectMenu,
		maxUsers: 2
	}).on('collect', async i => {
		await i.deferUpdate()

		if (i.customId === 'ticket-select-kit') name = i.values[0]
		else if (i.customId === 'ticket-select-amount') amount = parseInt(i.values[0])

		if (name !== '' && amount !== 0) {
			if (amount === -1)
				amount = await parseCustomKitsAmount(
					amount,
					msg.channel as TextChannel,
					'Введите своё количество в чат',
					[]
				)
			amount = clamp(1, amount, 1000000)
			t.kits.push({ name, amount })
			name = ''
			amount = 0
			await msg.edit({ content: getTicketContent(t) })
		}
	})
}

export async function checkPlantingButton(msg: Message, t: Ticket): Promise<boolean> {
	const msgTray: Message[] = []
	const chan = msg.channel! as TextChannel

	if (t.kits.length === 0) {
		msgTray.push(await msg.channel.send('Выберите хотя бы один кит'))
		return true
	}
	await chan.bulkDelete(msgTray)
	await toggleComponents(msg, true)
	return false
}

export async function checkTicket(interaction: ButtonInteraction, category: CategoryChannel) {
	const t = (await category.children.cache.find(
		c => c.type === ChannelType.GuildText && c.topic === interaction.user.id
	)) as TextBasedChannel

	if (t) {
		t.send(`Ваш тикет находится тут, ${interaction.user}`)
		await interaction.reply({ content: 'У вас уже есть тикет', ephemeral: true })
		return t
	}

	return null
}

export async function handlePayment(t: Ticket, interaction: CommandInteraction | ButtonInteraction) {
	t.category = 'delivery'

	const ts = ticketStage(t)
	await toggleComponents(ts.payment, true)

	const coordsText = `Ожидай заказ на: **${t.spot.x} ${t.spot.z}**\n`
	let desc = `${coordsText} Мы тебя уведомим по вылету и прибытию\n`
	const payload: BaseMessageOptions = {}

	if (t.planting === 'handover') {
		desc = 'Когда будешь готов получить заказ в руки, жми кнопку\n' + desc
		const button = new ButtonBuilder()
			.setCustomId('ticket-delivery-ready')
			.setLabel('Ожидаю на точке получения')
			.setStyle(ButtonStyle.Secondary)
		payload.components = [actionRow(button)]
	}

	payload.embeds = [
		new EmbedBuilder()
			.setTitle('Оплата прошла успешно')
			.setDescription(desc)
			.setColor('Fuchsia')
			.setFooter({ text: `Айди заказа: ${interaction.channel!.id}` }),
	]

	ts.delivery = await (await interaction.reply(payload)).fetch()

	await storeStagesInTicket(t, ts)
	await saveTicket(t)

	payload.components = []
	await interaction.user.send(payload)

	// говнокод
	const chan = (await interaction.channel!) as TextChannel
	const categories: TicketCategoryEntry[] = await getValue('ticket-categories')
	await chan.setParent(categories.find(c => c.name === 'доставка')!.channelId)
	await chan.setRateLimitPerUser(15)
}