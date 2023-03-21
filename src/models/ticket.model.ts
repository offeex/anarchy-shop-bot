import { getModelForClass, prop } from '@typegoose/typegoose'
import { OrderKitEntry } from '../utils/types.util'

export class Ticket {
	@prop() public channelId!: string
	@prop() public userId!: string
	@prop({ default: [] }) public kits!: OrderKitEntry[]
	@prop({ default: false }) public done!: boolean
}

export const TicketModel = getModelForClass(Ticket)