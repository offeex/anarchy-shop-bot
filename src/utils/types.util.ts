import { DocumentType } from '@typegoose/typegoose'
import { HydratedDocument } from 'mongoose'
import { BaseMessageOptions, MessagePayload } from 'discord.js'

export type Doc<T> = HydratedDocument<DocumentType<T>>

export type SendOptions = string | MessagePayload | BaseMessageOptions