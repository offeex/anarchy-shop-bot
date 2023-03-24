import { getModelForClass, prop, Ref } from '@typegoose/typegoose'
import { User } from 'discord.js'

export class TicketStages {
	@prop() public ticket!: Ref<User>

	@prop() public createId!: string
	@prop() public plantingId!: string
	@prop() public spotId!: string
	@prop() public paymentId!: string
	@prop() public deliveryId!: string
	@prop() public reviewId!: string
}

export const TicketStagesModel = getModelForClass(TicketStages)