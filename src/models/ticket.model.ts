import { getModelForClass, prop } from '@typegoose/typegoose'
import { OrderKitEntry, PlantingType, TicketCategory, Vec2 } from '../utils/types.util'

export class Ticket {
	@prop() public channelId!: string
	@prop() public userId!: string
	@prop({ default: [] }) public kits: OrderKitEntry[] = []
	@prop({ default: 'plant' }) public planting!: PlantingType
	@prop() public spot!: Vec2
	@prop({ default: 0 }) public totalPrice!: number
	@prop({ default: 'order' }) public category!: TicketCategory
}

export const TicketModel = getModelForClass(Ticket)