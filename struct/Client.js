const { AkairoClient, InhibitorHandler, ListenerHandler } = require('discord-akairo');
const Handler = require('./Handler');
const Enmap = require('enmap');
const config = require('../config');

class Client extends AkairoClient {

    constructor() {
        super({
            ownerID: config.owners
        }, {
            partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER']
        });

        this.config = config;
        this.rpDB = new Enmap({name: 'rp'})

        this.commandHandler = new Handler(this, {
            directory: './commands/',
            prefix: "!",
            allowMention: true
        });

        this.inhibitorHandler = new InhibitorHandler(this, {
            directory: './inhibitors/'
        });

        this.listenerHandler = new ListenerHandler(this, {
            directory: './events/'
        });

        this.listenerHandler.setEmitters({
            commandHandler: this.commandHandler,
            inhibitorHandler: this.inhibitorHandler,
            listenerHandler: this.listenerHandler
        });

        this.commandHandler.useListenerHandler(this.listenerHandler);
        this.listenerHandler.loadAll();

        this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
        this.inhibitorHandler.loadAll();

        this.commandHandler.loadAll();

    }

    get server() {
        return this.guilds.cache.get(config.serverId);
    }

    replaceStatus (status) {
        return status
            .replace("alive", "❤️ En vie ❤️")
            .replace("dead", "💀 Mort 💀")
            .replace("left", "💀 Mort 💀 (a quitté le rp)")
            .replace("unknown", "❔ Inconnu ❔")
    }

    async isImage (image) {
        return image.toLowerCase().endsWith('png') || image.endsWith('jpg');
        // let bool = false;
        //
        // try {
        //     const image = await Canvas.loadImage(url);
        //     bool = true
        // } catch (error) {
        //     bool = false
        // }
        //
        // return bool
    }

    getu = (mention) => {

        const matches = mention.match(/^<@!?(\d+)>$/);

        if (!matches) return;

        const [,id ] = matches[1];

        return client.users.cache.get(id);
    }

}

module.exports = Client;