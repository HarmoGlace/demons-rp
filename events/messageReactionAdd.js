const {Listener} = require('discord-akairo');

class Ready extends Listener {

    constructor() {
        super('messageReactionAdd', {
            emitter: 'client',
            event: 'messageReactionAdd'
        });
    }

    async exec(messageReaction, user) {
        const client = this.client;
        const {config: {channels: {rpVerif: rpVerifId, rpFiches: rpFichesId}, roles: {accepted}}, rpDB: rpdb} = client;
        const {message, emoji: {name: emote}} = messageReaction;

        if (messageReaction.partial) await messageReaction.fetch();
        if (message.partial) await message.fetch();
        if (message.member.partial) await message.member.fetch();

        const rpVerif = client.channels.cache.get(rpVerifId);
        const rpFiches = client.channels.cache.get(rpFichesId);

        if (message.channel.id === rpVerifId) {

            const user = rpdb.find(user => user.msgid === message.id);
            const key = rpdb.findKey(key => key === user);

            if (!user || !key) return;

            const member = await message.guild.members.fetch(key) || await client.users.fetch(key);
            const memberName = member?.displayName || member?.username || 'inconnu';
            const moderator = (await message.guild.members.fetch(user.id))?.displayName || (await client.users.fetch(user.id))?.username || 'inconnu';

            if (personne.status !== "waiting") return;

            let embed = message.embeds[0];

            if (emote === "✅") {

                embed.fields.splice(2, 1, {
                    name: embed.fields[2].name,
                    value: `✅ Acceptée par ${moderator}`
                });

                embed.color = 0x64eb34;

                await message.edit({
                    embed: embed
                });

                await member.send({
                    embed: {
                        color: embed.color,
                        title: "Ta demande d'accès au rp a été acceptée !",
                        description: "Tu peux désormais y accéder. Fais la commande ``!rp`` pour avoir plus d'informations"
                    }
                });

                embed.color = 0x3051e3;
                embed.title = `Personnage de ${memberName}`;
                embed.fields.splice(2, 1, {
                    name: 'Status du personnage',
                    value: '❤ En vie'
                });


                const rpmsg = await rpFiches.send({
                    embed: embed
                });

                rpdb.set(member.id, "accepted", "status");
                rpdb.set(member.id, rpmsg.id, "ficheId");

                member.roles.add(accepted);

                await message.reactions.removeAll();


            } else if (emote == "❌") {

                const confirmation = await message.channel.send(`${modo}, envoie ici la raison. Tu as 10 minutes pour le faire, sinon ton action sera annulée.`)

                const collector = message.channel.createMessageCollector(msg => msg.author.id == modo.id, {time: 600000})

                collector.on("collect", async (m) => {
                    const raison = m.content

                    if (raison.lenth >= 980) return message.channel.send(`Désolé ${msg.author} mais ta raison est trop longue. Elle doit faire moins de 980 caractères`)


                    rpdb.set(key, "denied", "status")

                    if (member) {
                        let embedmember = {}


                        await member.send({
                            embed: {
                                color: refused,
                                fields: [
                                    {
                                        name: `Votre demande d'accès au rp a été refusée.`,
                                        value: `**Raison : ${raison}**\n_Nb : vous pouvez contester cela en envoyant un message ici._`,
                                    }
                                ]
                            }
                        })
                    }

                    embed.fields.splice(2, 1, {
                        name: embed.fields[2].name,
                        value: `❌ Refusée par ${modo}.\nRaison : ${raison}`
                    });
                    embed.color = 0xeb4034;

                    await message.edit({
                        embed: embed
                    });

                    await m.delete();
                    await message.reactions.removeAll();
                    rpdb.set(member.id, "refused", "status");
                    collector.stop();
                })

                collector.on("end", async (end) => {
                    await confirmation.delete();
                })

            }

        }
    }
}

module.exports = Ready;
