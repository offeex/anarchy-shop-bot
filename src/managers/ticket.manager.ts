import { Doc } from '../utils/types.util'
import { Ticket } from '../models/ticket.model'
import {
	ActionRowBuilder,
	BaseMessageOptions,
	ButtonBuilder,
	ButtonStyle,
	ComponentType, Message,
	SelectMenuBuilder,
	StringSelectMenuBuilder,
	TextBasedChannel
} from 'discord.js'
import { OfferModel } from '../models/offer.model'

// Key is a channel id
export let activeTickets: Map<string, Doc<Ticket>> = new Map()

export function getTicketContent(tm: Doc<Ticket>): string {
	let content = `Выбрано:\n`
	for (const kit of tm.kits)
		content += `- ${kit.name}, ${kit.amount}x\n` // - Кит для выживания, 54x
	return content
}

export async function createChooseKitPrompt(t: TextBasedChannel, tm: Doc<Ticket>) {
	const kitsSelectMenu = new StringSelectMenuBuilder()
		.setCustomId('ticket-select-kit')
		.setPlaceholder('Выберите кит')
	for (const o of await OfferModel.find())
		kitsSelectMenu.addOptions({ label: o.name, value: o.name })

	const amountSelectMenu = new StringSelectMenuBuilder()
		.setCustomId('ticket-select-amount')
		.setPlaceholder('Выберите количество')
		.setOptions([
			{ label: '1 шалкер', value: '1' },
			{ label: '27 шалкеров (Пол даба)', value: '27' },
			{ label: '54 шалкера (Даб)', value: '54' },
			{ label: 'Своё количество', value: '100', description: 'Введите своё количество в чат' }
		])

	const nextKitButton = new ButtonBuilder()
		.setCustomId('ticket-next-kit')
		.setStyle(ButtonStyle.Success)
		.setLabel('Выбирать дальше')
	const continueButton = new ButtonBuilder()
		.setCustomId('ticket-continue')
		.setStyle(ButtonStyle.Primary)
		.setLabel('Я всё выбрал')

	const payload: BaseMessageOptions = {
		content: getTicketContent(tm),
		components: [
			new ActionRowBuilder<SelectMenuBuilder>().setComponents(kitsSelectMenu),
			new ActionRowBuilder<SelectMenuBuilder>().setComponents(amountSelectMenu),
			new ActionRowBuilder<ButtonBuilder>().setComponents(nextKitButton, continueButton)
		]
	}
	return payload
}

export async function handleChooseKitPrompt(m: Message, tm: Doc<Ticket>) {
	const kitInfoCollector = await m.createMessageComponentCollector({
		filter: i => i.customId === 'ticket-select-kit' || i.customId === 'ticket-select-amount',
		componentType: ComponentType.SelectMenu,
		maxUsers: 2,
	})

	let name: string = '', amount: number = 0

	kitInfoCollector.on('collect', async i => {
		i.deferUpdate()

		if (i.customId === 'ticket-select-kit')
			name = i.values[0]
		else if (i.customId === 'ticket-select-amount')
			amount = parseInt(i.values[0])

		if (name !== '' && amount !== 0)
			tm.kits.push({ name, amount })
	})

}