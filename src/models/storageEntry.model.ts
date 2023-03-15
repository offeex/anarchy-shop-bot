import { getModelForClass, prop } from '@typegoose/typegoose'

export class StorageEntry {
    @prop({ unique: true }) public key!: string
    @prop() public value!: string
}

export const StorageEntryModel = getModelForClass(StorageEntry)
