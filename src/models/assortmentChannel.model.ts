import { getModelForClass, prop } from '@typegoose/typegoose'

export class AssortmentChannel {
	@prop({ unique: true }) public name!: string
	@prop() public channelId!: string
}

export const AssortmentChannelModel = getModelForClass(AssortmentChannel)