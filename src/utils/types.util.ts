import { HydratedDocument } from 'mongoose'
import { BaseMessageOptions, Message, MessagePayload } from 'discord.js'
import { DocumentType } from '@typegoose/typegoose'

export type Doc<T> = HydratedDocument<DocumentType<T>>

export type SendOptions = string | MessagePayload | BaseMessageOptions

type InstructionType = 'order' | 'delivery'
export type InstructionEntry = {
	name: InstructionType,
	value: string,
	channelId?: string,
	msgId?: string
}

export type OrderKitEntry = { name: string; amount: number }
export type TicketStageName = 'оформление' | 'доставка' | 'выполнено'
// говнокод
export type TicketCategoryEntry = { name: TicketStageName; channelId: string }

export class TicketStages {
	public create!: Message
	public planting!: Message
	public spot!: Message
	public payment!: Message
	public delivery?: Message
	public review?: Message
}

export class TicketFees {
	planting: number = 0
	spot: number = 0
	totalAmount!: number
}

export type PlantingType = 'plant' | 'handover'
export type SpotType = 'pick' | 'generate'

export interface Vec2 {
	x: number
	z: number
}
