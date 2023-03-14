import { DocumentType } from '@typegoose/typegoose'
import { HydratedDocument } from 'mongoose'

export type Doc<T> = HydratedDocument<DocumentType<T>>

// export type Offer = {
// 	name: string,
// 	category: string,
// 	price: number // в рублях
// 	peekImageURL: string,
// 	iconURL: string,
// 	inStock: boolean,
// }