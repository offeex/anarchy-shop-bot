import { getModelForClass, prop } from '@typegoose/typegoose'
import { OrderKitEntry, PlantingType, Vec2 } from '../utils/types.util'

type Stage = 'order' | 'delivery' | 'done'

export class StagesEntry {
	@prop() public createId!: string
	@prop() public plantingId!: string
	@prop() public spotId!: string
	@prop() public paymentId!: string
	@prop() public deliveryId?: string
	@prop() public reviewId?: string
}

export class Ticket {
	@prop() public channelId!: string
	@prop() public userId!: string
	@prop({ default: [] }) public kits: OrderKitEntry[] = []
	@prop({ default: 'plant' }) public planting!: PlantingType
	@prop() public spot!: Vec2
	@prop({ default: 0 }) public totalPrice!: number
	@prop({ default: 'order' }) public category: Stage = 'order'
	@prop() public stages!: StagesEntry
}

export const TicketModel = getModelForClass(Ticket)