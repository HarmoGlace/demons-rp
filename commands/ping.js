const Command = require('../struct/Command');

class Ping extends Command {
    constructor() {
        super('ping', { // id
            aliases: ['ping']
        })
    }

    async exec(msg, args) {

        const client = this.client;

        const message = await msg.channel.send('Calcul de mon ping en cours...');

        await message.edit(`J'ai ${message.createdTimestamp - msg.createdTimestamp}ms de ping`);
    }
}

module.exports = Ping;