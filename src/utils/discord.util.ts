import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ComponentType,
    Message,
    AnyComponentBuilder,
    MessageActionRowComponentBuilder,
    TextChannel
} from 'discord.js'
import { SendOptions } from './types.util'

export function getAtm(url: string, name: string) {
	return new AttachmentBuilder(url, { name })
}

export function atmName(ab: AttachmentBuilder) {
	return `attachment://${ab.name}`
}

export async function sendIfNotExists(
    payload: SendOptions,
    msgId: string | undefined,
    chan: TextChannel
) {
    if (msgId) {
        try {
            const fetchedMsg = await chan.messages.fetch(msgId)
            return (await fetchedMsg.edit(payload)).id
        } catch (e: any) {
            return (await chan.send(payload)).id
        }
    } else return (await chan.send(payload)).id
}

export function actionRow<T extends AnyComponentBuilder>(
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
