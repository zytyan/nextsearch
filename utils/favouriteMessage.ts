import {MessageType} from "@/utils/MessageType";

class FavouriteMessage {
    readonly messages: MessageType[] = []
    private readonly messageIdSet: Set<string> = new Set()

    constructor() {
        if (typeof window === 'undefined') {
            return
        }
        this.messages = JSON.parse(localStorage.favourite ?? "[]") ?? []
        this.messages.map(msg => {
            this.messageIdSet.add(msg.mongo_id)
        })
    }

    has = (msg: MessageType) => {
        return this.messageIdSet.has(msg.mongo_id)
    }
    add = (msg: MessageType) => {
        if (this.has(msg)) {
            return
        }
        this.messageIdSet.add(msg.mongo_id)
        this.messages.push(msg)
    }
    remove = (msg: MessageType) => {
        if (!this.has(msg)) {
            return
        }
        this.messageIdSet.delete(msg.mongo_id)
        const index = this.messages.findIndex(value => value.mongo_id === msg.mongo_id)
        if (index > -1) {
            this.messages.splice(index, 1)
        }
    }
    save = () => {
        localStorage.favourite = JSON.stringify(this.messages)
    }
}

export const favouriteMessage = new FavouriteMessage()