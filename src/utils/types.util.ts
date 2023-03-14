import { DocumentType } from '@typegoose/typegoose'
import { HydratedDocument } from 'mongoose'

export type Doc<T> = HydratedDocument<DocumentType<T>>