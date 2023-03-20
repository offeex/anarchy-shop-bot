import { AttachmentBuilder, TextChannel } from 'discord.js'
import { SendOptions } from './types.util'
import { getValue, setValue } from './storage.util'

export function getAtm(url: string, name: string) {
	return new AttachmentBuilder(url, { name })
}

export function atmName(ab: AttachmentBuilder) {
	return `attachment://${ab.name}`
}

export async function sendIfNotExists(msg: SendOptions, msgId: string, chan: TextChannel) {
	if (msgId) {
		try {
			const fetchedMsg = await chan.messages.fetch(msgId)
			return (await fetchedMsg.edit(msg)).id
		} catch (e: any) {
			return (await chan.send(msg)).id
		}
	} else return (await chan.send(msg)).id
}

export async function sendWithEntry(entry: string, msg: SendOptions, chan: TextChannel) {
	let msgId = await getValue('order-instruction-id') as string
	msgId = await sendIfNotExists(msg, msgId, chan)
	await setValue('order-instruction-id', msgId)
}