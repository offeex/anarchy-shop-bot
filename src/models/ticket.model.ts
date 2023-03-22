import {getModelForClass, prop} from '@typegoose/typegoose'
import {OrderKitEntry, PlantingType, Vec2} from '../utils/types.util'

export class Ticket {
    @prop() public channelId!: string
    @prop() public userId!: string
    @prop({default: []}) public kits!: OrderKitEntry[]
    @prop({default: 'plant'}) public planting!: PlantingType
    @prop() public spot?: Vec2
    @prop({default: 0}) public totalPrice!: number
    @prop({default: false}) public done!: boolean
}

export const TicketModel = getModelForClass(Ticket)