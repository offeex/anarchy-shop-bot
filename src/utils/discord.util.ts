import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ComponentType,
    Message,
    MessageActionRowComponentBuilder,
    TextChannel
} from 'discord.js'
import { SendOptions } from './types.util'
import { getValue, setValue } from './storage.util'

export function getAtm(url: string, name: string) {
	return new AttachmentBuilder(url, { name })
}

export function atmName(ab: AttachmentBuilder) {
	return `attachment://${ab.name}`
}

export async function sendIfNotExists(
    msg: SendOptions,
    msgId: string,
    chan: TextChannel
) {
    if (msgId) {
        try {
            const fetchedMsg = await chan.messages.fetch(msgId)
            return (await fetchedMsg.edit(msg)).id
        } catch (e: any) {
            return (await chan.send(msg)).id
        }
    } else return (await chan.send(msg)).id
}

export async function sendWithEntry(msg: SendOptions, chan: TextChannel) {
    let msgId = (await getValue('order-instruction-id')) as string
    msgId = await sendIfNotExists(msg, msgId, chan)
    await setValue('order-instruction-id', msgId)
}

// за этот говнокод тож спс тайпскрипту

export async function resolveButtonClick(msg: Message, interaction: ButtonInteraction) {
    const res = await msg.awaitMessageComponent({
        filter: i => i.user.id === interaction.user.id,
        time: 30000,
        componentType: ComponentType.Button,
    })
    res.deferUpdate()
    return res
}

export async function resolveSelectMenu(msg: Message, interaction: ButtonInteraction) {
    const res = await msg.awaitMessageComponent({
        filter: i => i.user.id === interaction.user.id,
        time: 30000,
        componentType: ComponentType.SelectMenu,
    })
    res.deferUpdate()
    return res
}

export function actionRow<T extends MessageActionRowComponentBuilder>(
    ...builder: T[]
): ActionRowBuilder<T> {
    return new ActionRowBuilder<T>().setComponents(builder)
}

export async function toggleComponents(msg: Message, disabled: boolean) {
    const components = msg.components.map(row => {
        const builder = ActionRowBuilder.from<MessageActionRowComponentBuilder>(row)
        builder.components.forEach(c => c.setDisabled(disabled))
        return builder
    })
    return await msg.edit({components})
}

export function toggleActionRowBuilder(
    ar: ActionRowBuilder<ButtonBuilder>,
    disabled: boolean
) {
    ar.components.forEach(c => c.setDisabled(disabled))
    return ar
}

export async function resolveInteractionUpdate(interaction: ButtonInteraction) {
    const isNew = !interaction.replied && !interaction.deferred
    if (isNew) await interaction.deferUpdate()
    return isNew
}
