import {DocumentType} from '@typegoose/typegoose'
import {HydratedDocument} from 'mongoose'
import {BaseMessageOptions, Message, MessagePayload} from 'discord.js'

export type Doc<T> = HydratedDocument<DocumentType<T>>

export type SendOptions = string | MessagePayload | BaseMessageOptions

export type OrderKitEntry = { name: string; amount: number }
export type TicketCategoryName = 'оформление' | 'доставка' | 'выполнено'
export type TicketCategoryEntry = { name: TicketCategoryName; channelId: string }

type TicketStage = 'create' | 'planting' | 'spot' | 'payment' | 'delivery' | 'done'
export type TicketStageMessages = { [stage in TicketStage]?: Message }

export type TicketFee = {
    plantingPriority?: number,
    spotDistance?: number
    totalAmount?: number
}

export type PlantingType = 'plant' | 'handover'
export type SpotType = 'pick' | 'generate'

export interface Vec2 {
    x: number
    y: number
}
