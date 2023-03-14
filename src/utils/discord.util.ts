import { AttachmentBuilder } from 'discord.js'

export function getAtt(url: string, name: string) {
	console.log(url, name)
	return new AttachmentBuilder(url, { name })
}

export function attName(ab: AttachmentBuilder) {
	return `attachment://${ab.name}`
}