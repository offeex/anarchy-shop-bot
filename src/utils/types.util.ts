import { DocumentType } from '@typegoose/typegoose'
import { HydratedDocument } from 'mongoose'
import { BaseMessageOptions, Message, MessagePayload } from 'discord.js'

export type Doc<T> = HydratedDocument<DocumentType<T>>

export type SendOptions = string | MessagePayload | BaseMessageOptions

export type InstructionEntry = { name: string, value: string, channelId: string }
export type OrderKitEntry = { name: string; amount: number }
export type TicketCategoryName = 'оформление' | 'доставка' | 'выполнено'
export type TicketCategoryEntry = { name: TicketCategoryName; channelId: string }

export class TicketStages {
    public create!: Message
    public planting!: Message
    public spot!: Message
    public payment!: Message
    public success?: Message
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
    y: number
}
