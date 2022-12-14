class logformatter {
    /*
Imported from https://github.com/qwreey75/disbucket/blob/master/init.lua

-- colors
local colors = {
    ["%[.-:.-:.- WARN%]:.-"] = "\27[33;1m%s\27[0m";
    [".-issued server command:.-"] = "\27[32;1m%s\27[0m";
    [".-joined the game.-"] = "\27[33;1m%s\27[0m";
    [".-left the game.-"] = "\27[33;1m%s\27[0m";
    ["(%[.- INFO%]: )(%[.+%])(.-)"] = "%s\27[47;1m%s\27[0m%s";
}
local colorsAfter = {
    ["%d+%.%d+%.%d+%.%d+:%d+"] = "\27[32;1m( IP-Port )\27[0m";
    ["%d+%.%d+%.%d+%.%d+"] = "\27[32;1m( IP )\27[0m";
    [".-issued server command: /w .-"] = "\27[32;1m[ Private Message ]\27[0m";
    [".-issued server command: /msg .-"] = "\27[32;1m[ Private Message ]\27[0m";
    [".-issued server command: /tell .-"] = "\27[32;1m[ Private Message ]\27[0m";
    [".-issued server command: /teammsg .-"] = "\27[32;1m[ Private Message ]\27[0m";
    [".-issued server command: /tm .-"] = "\27[32;1m[ Private Message ]\27[0m";
    ["%[.-:.-:.- WARN%]:.-"] = "\27[33;1m%s\27[0m";
    [".-issued server command:.-"] = "\27[32;1m%s\27[0m";
    // [".-joined the game.-"] = "\27[33;1m%s\27[0m";
    // [".-left the game.-"] = "\27[33;1m%s\27[0m";
    ["(%[.- INFO%]: )(%[.+%])(.-)"] = "%s\27[47;1m%s\27[0m%s";
}

    */

    defaultColorFormatter = [
        // ips
        [/\d+\.\d+\.\d+\.\d+:\d+/,"\x1b[32;1m( IP-Port )\x1b[0m"],
        [/\d+\.\d+\.\d+\.\d+/,"\x1b[32;1m( IP )\x1b[0m"],

        // claer some useless datas
        [/^\s*(\[\d+:\d+:\d+\] )\[Async Chat Thread - #\d+\/INFO\]:\s?/,"$1"],
        [/^\s*(\[\d+:\d+:\d+\] )\[Server thread\/INFO\]:\s?/,"$1"],

        // join and leave message
        [/^\s*\[\d+:\d+:\d+\] [^ ]+ joined the game/,str=>`\x1b[33;1m${str}\x1b[0m`],
        [/^\s*\[\d+:\d+:\d+\] [^ ]+ left the game/,str=>`\x1b[33;1m${str}\x1b[0m`],

        // commands
        [/^\s*\[\d+:\d+:\d+\] [^ ]+ issued server command:/,str=>`\x1b[32;1m${str}\x1b[0m`],

        // advancement
        [/^\s*\[\d+:\d+:\d+\] [^ ]+ has made the advancement \[.+\]/,str=>`\x1b[36;1m${str}\x1b[0m`],

        // chat
        [/^\s*\[\d+:\d+:\d+\] <[^ ]+>/,str=>`\x1b[34;1m${str}\x1b[0m`],

        // server started, stopped message
        [/^\s*(\[\d+:\d+:\d+\])? ?Stopping the server/,"\x1b[31;1m[ Server closed ]\x1b[0m"],
        [/^\s*(\[\d+:\d+:\d+\])? ?Timings Reset/,"\x1b[32;1m[ Server started ]\x1b[0m"],
    ]

    defaultIgnore = [
        // private messages
        /^\s*\[\d+:\d+:\d+\] \[Server thread\/INFO\]: [^ ]+ issued server command: \/teammsg /,
        /^\s*\[\d+:\d+:\d+\] \[Server thread\/INFO\]: [^ ]+ issued server command: \/tell /,
        /^\s*\[\d+:\d+:\d+\] \[Server thread\/INFO\]: [^ ]+ issued server command: \/msg /,
        /^\s*\[\d+:\d+:\d+\] \[Server thread\/INFO\]: [^ ]+ issued server command: \/tm /,
        /^\s*\[\d+:\d+:\d+\] \[Server thread\/INFO\]: [^ ]+ issued server command: \/w /,

        // hidding repeated join and leave message
        /^\s*\[\d+:\d+:\d+\] \[Server thread\/INFO\]: [^ ]+ logged in with entity id/,
        /^\s*\[\d+:\d+:\d+\] \[Server thread\/INFO\]: [^ ]+ lost connection:/,

        // auth and server messages
        /^\s*\[\d+:\d+:\d+\] \[User Authenticator #\d+\/INFO\]:/,
        /^\s*\[\d+:\d+:\d+\] \[ServerMain\/INFO\]:/,
        /^\s*\[\d+:\d+:\d+\] \[Worker-Main-\d+\/INFO\]:/,
    ]

    constructor(config) {
        this.config = config
        this.colorFormatter = []
        this.ignore = []

        let colorFormatter = config?.colorFormatter,
            ignore = config?.ignore
        if (colorFormatter)
            this.appendColorFormatter(colorFormatter)
        if (ignore)
            this.appendIgnore(ignore)

        if (!config?.disableLoadDefaultFormatter) 
            this.appendColorFormatter(this.defaultColorFormatter)
        if (!config?.disableLoadDefaultIgnore)
            this.appendIgnore(this.defaultIgnore)
    }

    appendColorFormatter(colorFormatters) {
        this.colorFormatter.push(...colorFormatters)
    }

    appendIgnore(ignores) {
        this.ignore.push(...ignores)
    }

    format(/** @type { String } */ str) {
        for (const ignore of this.ignore) {
            // console.log(str.match(ignore))
            if (str.match(ignore)) return null
        }
        for (const formatter of this.colorFormatter) {
            str = str.replace(formatter[0],formatter[1])
        }
        return str
    }
}
module.exports = logformatter
