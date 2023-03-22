import {Doc, TicketFee, TicketStageMessages, Vec2} from '../utils/types.util'
import {Ticket} from '../models/ticket.model'
import {
    APISelectMenuOption,
    BaseMessageOptions,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    Interaction,
    Message,
    StringSelectMenuBuilder,
    TextBasedChannel,
    TextChannel,
} from 'discord.js'
import {parseVec2} from '../utils/number.util'
import {actionRow, toggleComponents} from '../utils/discord.util'
import {offers} from './offer.manager'

// Key is a channel id
export let activeTickets: Map<string, Doc<Ticket>> = new Map()
export let ticketFees = new Map<string, TicketFee>()
export let ticketMessages: Map<string, TicketStageMessages> = new Map()

export function getTicketContent(tm: Doc<Ticket>): string {
    let content = `Выбрано:\n`
    for (const kit of tm.kits) content += `- ${kit.name}, ${kit.amount}x\n` // - Кит для выживания, 54x
    return content
}

export async function getTicket(i: Interaction) {
    return activeTickets.get(i.channel!.id)! as Doc<Ticket>
}

export async function createChooseKitMenus(t: TextBasedChannel, tm: Doc<Ticket>) {
    const kitsSelectMenu = new StringSelectMenuBuilder()
        .setCustomId('ticket-select-kit')
        .setPlaceholder('Выберите кит')
    for (const o of offers) kitsSelectMenu.addOptions({label: o.name, value: o.name})

    const amountSelectMenu = new StringSelectMenuBuilder()
        .setCustomId('ticket-select-amount')
        .setPlaceholder('Выберите количество')
        .setOptions([
            {label: '1 шалкер', value: '1'},
            {label: '27 шалкеров (Пол даба)', value: '27'},
            {label: '54 шалкера (Даб)', value: '54'},
            {
                label: 'Своё количество',
                value: '-1',
                description: 'Введите своё количество в чат',
            },
        ])

    const continueButton = new ButtonBuilder()
        .setCustomId('ticket-planting')
        .setStyle(ButtonStyle.Primary)
        .setLabel('Я всё выбрал')
    const resetKitsButton = new ButtonBuilder()
        .setCustomId('ticket-reset-kits')
        .setStyle(ButtonStyle.Danger)
        .setLabel('Сбросить выбор')

    const payload: BaseMessageOptions = {
        content: getTicketContent(tm),
        components: [
            actionRow(kitsSelectMenu),
            actionRow(amountSelectMenu),
            actionRow(continueButton, resetKitsButton),
        ],
    }
    return payload
}

async function parseCustomKitsAmount(
    amount: number,
    chan: TextChannel,
    content: string,
    msgTray: Message[]
): Promise<number> {
    const msg = await chan.send(content)
    const res = (await chan.awaitMessages({max: 1})).first()!
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

export async function parseCustomSpot(
    chan: TextChannel,
    content: string,
    msgTray: Message[]
): Promise<Vec2> {
    const msg = await chan.send(content)
    const res = (await chan.awaitMessages({max: 1})).first()!
    msgTray.push(msg, res)
    const spot = parseVec2(res.content)
    if (spot == null) {
        return await parseCustomSpot(chan, 'Неверное количество, введи число', msgTray)
    }
    await chan.bulkDelete(msgTray)
    return spot
}

export async function handleChooseKitMenus(msg: Message, tm: Doc<Ticket>) {
    const kitInfoCollector = await msg.createMessageComponentCollector({
        filter: i =>
            i.customId === 'ticket-select-kit' || i.customId === 'ticket-select-amount',
        componentType: ComponentType.SelectMenu,
        maxUsers: 2,
    })

    let name: string = '',
        amount: number = 0

    kitInfoCollector.on('collect', async i => {
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
            tm.kits.push({name, amount})
            name = ''
            amount = 0
            msg.edit({content: getTicketContent(tm)})
        }
    })
}

export async function checkPlantingButton(
    msg: Message,
    tm: Doc<Ticket>
): Promise<boolean> {
    const msgTray: Message[] = []
    const chan = msg.channel! as TextChannel

    if (tm.kits.length === 0) {
        msgTray.push(await msg.channel.send('Выберите хотя бы один кит'))
        return true
    }
    await chan.bulkDelete(msgTray)
    await toggleComponents(msg, true)
    return false
}
