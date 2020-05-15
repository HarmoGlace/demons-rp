const { Listener } = require('discord-akairo');

class Ready extends Listener {

    constructor() {
        super('ready', {
            emitter: 'client',
            event: 'ready'
        });
    }

    async exec() {
        const client = this.client;

        const guilds = client.guilds.cache.size

        console.log(`Started on ${client.user.tag} on ${guilds} ${guilds <= 1 ? 'guild': 'guilds'}`);

    }
}

module.exports = Ready;