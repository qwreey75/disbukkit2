const { TextChannel, Message } = require("discord.js")

class messageBuffer {
    constructor (channel,lastMessage,config) {
        /** @type { Message } */
        this.lastMessage = lastMessage
        /** @type { TextChannel } */
        this.channel = channel

        this.committed = []
        this.updateTimeout = null
        this.changedWhenTimeout = false
        this.delay = config?.delay ?? 1500

        this.header = config?.header ?? "```ansi\n"
        this.footer = config?.footer ?? "\n```"
        this.maxlength = (config?.maxlength ?? 2000) - this.header.length - this.footer.length
    }

    async commitMessage() {
        let lastCommitted = this.committed
        this.committed = [lastCommitted[lastCommitted.length-1]]
        for (let index = 0;index<lastCommitted.length;index++) {
            let str = lastCommitted[index]
            if (!str) continue
            let content = str+this.footer
            if (index == 0 && this.lastMessage?.editable) {
                if (this.lastMessage.content != content) {
                    try {await this.lastMessage.edit(content)}
                    catch (err) {
                        console.error(`Error occurred on editing message\n${occured}`)
                        this.lastMessage = await this.channel.send(content)
                    }
                }
                continue
            }
            this.lastMessage = await this.channel.send(content)
        }
    }

    delayedUpdate() {
        this.updateTimeout = null
        if (this.changedWhenTimeout) {
            this.changedWhenTimeout = false
            this.commitMessage()
            this.updateTimeout = setTimeout(
                this.delayedUpdate.bind(this),
                this.delay,this
            )
        }
    }

    updateMessage() {
        if (this.updateTimeout) {
            this.changedWhenTimeout = true
        } else {
            this.commitMessage()
            this.updateTimeout = setTimeout(
                this.delayedUpdate.bind(this),
                this.delay,this
            )
        }
    }

    appendMessage(appendString,noFormatter) {
        let formatter = this.formatter
        appendString.split(/\r?\n/).forEach(str=>{
            if ((!noFormatter) && formatter) str = formatter(str)
            if (!str || str.length == 0) return

            str = str.trim() + "\n"
            let buflen = this.committed.length
            if (buflen == 0 || !this.committed[0]) {
                this.committed[0] = this.header
                buflen = 1
            }

            if (this.committed[buflen-1].length + str.length <= this.maxlength) {
                this.committed[buflen-1] += str
            } else this.committed[buflen] = this.header + str.substring(this.maxlength)
        })

        this.updateMessage()
    }
}
module.exports = messageBuffer