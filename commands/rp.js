const Command = require('../struct/Command');

class Rp extends Command {
    constructor() {
        super('rp', { // id
            aliases: ['rp'],
            args: [
                {
                    id: 'all',
                    type: 'string',
                    match: 'separate'
                }
            ]
        })
    }

    async exec(msg, argsRaw) {
        const client = this.client
        const config = client.config
        const args = argsRaw?.all;

        const { rpDB } = client;
        const defaultcolor = 0x3051e3;
        const sucess = 0x64eb34;
        const refused = 0xeb4034;
        const stops = ['stop', 'stopper', 'cancel', 'annuler'];
        const rpverif = client.channels.cache.get(config.channels.rpVerif);

        const commands = [
            {
                id: 'leave',
                description: 'Quitte le rp et déclare mort votre personnage'
            },
            {
                id: 'status',
                description: 'Permet de mettre à jour le status de votre personnage rp'
            },
            // { //                  IN WORK IN PROGRESS - MAY NOT FULLY WORK
            //     id: 'update',
            //     description: 'Permet de mettre à jour les informations de votre personnage rp'
            // },
            {
                id: 'info',
                description: 'Permet d\'avoir des informations sur un personnage rp'
            },
            // { //               TO AVOID INDEXING DO NOT UNCOMMENT THIS
            //     id: 'enter',
            //     description: 'Permet d'entrer dans le rp'
            // }
        ];

        this.cmdlist = commands;
        this.lemsg = msg;
        this.defaultcolor = defaultcolor;

        if (!rpDB.has(msg.author.id) || rpDB.get(msg.author.id, 'status') !== 'accepted') {

            if (rpDB.has(msg.author.id) && rpDB.get(msg.author.id, 'status') === 'waiting') return msg.channel.send(`${msg.author}, attend que ta demande soit traitée !`);

            if (!args || args[0].toLowerCase() !== 'enter') return msg.channel.send(`${msg.author}, fais \`\`!rp enter\`\` pour envoyer une demande d'entrée au rp`);

            const channel = msg.channel;

            await msg.channel.send(`${msg.author},`, {
                embed: {
                    color: defaultcolor,
                    title: 'Entre dans le rp',
                    description: 'Tout d\'abord, je t\'invite à envoyer ici le nom du personnage que tu souhaiterais avoir.\nNB : Le pseudo doit faire entre 4 et 32 caractères (inclus)'
                }
            });

            const filter = m => m.author.id === msg.author.id;
            const collector = channel.createMessageCollector(filter);


            collector.on('collect', (m) => {
                if (stops.includes(m.content.toLowerCase())) {
                    channel.send(`${msg.author}, commande annulée.`);
                    return collector.stop();
                }

                if (m.content.length <= 32 && m.content.length >= 4) {
                    const pseudo = m.content;
                    msg.channel.send(`${msg.author}, tu as choisi ${pseudo} pour le rp.`, {
                        embed: {
                            color: defaultcolor,
                            title: 'Maintenant, tu vas devoir choisir un avatar',
                            description: 'Pour cela, envoie ici l\'image que tu souhaiterais avoir en tant qu\'avatar'
                        }
                    })

                    collector.stop();
                    const collector2 = channel.createMessageCollector(filter);

                    collector2.on('collect', async (message) => {
                        if (stops.includes(m.content.toLowerCase())) {
                            channel.send(`${msg.author}, commande annulée`)
                            return collector2.stop()
                        }

                        const attachements = message.attachments;

                        if (!attachements || !attachements.first()) return channel.send(`${msg.author}, poste ton avatar ici, ne me donne pas un lien !`);

                        const url = attachements.first().url

                        if (!await client.isImage(url)) return msg.channel.send(`${msg.author}, tu dois envoyer une image !`)


                        channel.send(`${msg.author}, tu as définit ton avatar rp`, {
                            embed: {
                                color: defaultcolor,
                                title: 'Maintenant, envoie une description détaillée de ton personnage',
                                description: 'Elle devra faire moins de 1000 caractères\nNB : voici l\'avatar que tu as choisit',
                                thumbnail: {
                                    url: url
                                }
                            }
                        })

                        collector2.stop()

                        const collector3 = channel.createMessageCollector(filter)

                        collector3.on('collect', async (lemessage) => {
                            const description = lemessage.content

                            if (description.length <= 50) return channel.send(`${msg.author}, ta description est trop courte !`)
                            if (description.length > 1000) return channel.send(`${msg.author}, ta description ne doit pas excéder 1000 caractères !`)
                            collector3.stop()

                            const awaitmsg = await channel.send({
                                embed: {
                                    color: defaultcolor,
                                    title: 'Confirme l\'envoi de ta demande pour participer au rp',
                                    fields: [
                                        {
                                            name: 'Nom de ton personnage',
                                            value: pseudo,
                                            inline: true
                                        },
                                        {
                                            name: 'Description de ton personnage',
                                            value: description,
                                            inline: true
                                        },
                                        {
                                            name: 'Avatar de ton personnage',
                                            value: '\u200B'
                                        }
                                    ],
                                    thumbnail: {
                                        url: url
                                    },
                                    footer: {
                                        text: 'Réagis avec ✅ pour confirmer ou ❌ pour annuler'
                                    }
                                }
                            })

                            const reactioncollector = awaitmsg.createReactionCollector((reaction, user) => reaction.emoji.name == '✅' && user.id == msg.author.id || reaction.emoji.name == '❌' && user.id == msg.author.id)

                            reactioncollector.on('collect', async (reaction, user) => {

                                if (reaction.emoji.name === '✅') {

                                    const lemsg = await rpverif.send({
                                        embed: {
                                            color: 0x3734eb,
                                            title: `Demande d'accès au rp de ${msg.member.displayName}`,
                                            fields: [
                                                {
                                                    name: 'Pseudo rp',
                                                    value: pseudo
                                                },
                                                {
                                                    name: 'Description',
                                                    value: description
                                                },
                                                {
                                                    name: 'Status',
                                                    value: 'En attente'
                                                }
                                            ],
                                            author: {
                                                name: msg.member.displayName,
                                                icon_url: msg.author.displayAvatarURL()
                                            },
                                            thumbnail: {
                                                url: url,
                                            },
                                        }
                                    });

                                    rpDB.set(msg.author.id, {
                                        name: pseudo,
                                        avatar: url,
                                        description: description,
                                        status: 'waiting',
                                        msgid: lemsg.id,
                                        rpstatus: 'alive'
                                    });

                                    channel.send(`${msg.author}, ta demande a été envoyée !`);

                                    await lemsg.react('✅');
                                    await lemsg.react('❌');
                                } else if (reaction.emoji.name === '❌') {
                                    channel.send(`${msg.author}, tu as annulé l'envoi de la demande d'accès au rp`);
                                }
                                awaitmsg.reactions.removeAll();
                                return reactioncollector.stop();
                            })

                            await awaitmsg.react('✅');
                            await awaitmsg.react('❌');


                        })


                    })
                } else {
                    msg.channel.send(`${msg.author}, ton pseudo doit faire entre 4 et 32 caractères !`);
                }
            });


        } else {

            if (!args) {
                this.sendCommands();
            } else {
                const command = args[0].toLowerCase();
                const match = commands.find(c => c.id.toLowerCase() === command);

                if (match) {


                    const rpuser = rpDB.get(msg.author.id);


                    if (command === 'info') {
                        const user = client.getu(args[1]) || msg.author;

                        const member = await msg.guild.members.fetch(user.id);

                        const rpu = rpDB.get(member.id);

                        if (!rpu || rpu.status !== 'accepted') return msg.channel.send(`Désolé ${msg.author}, mais ${member.displayName} ne fait pas partie du rp`);

                        await msg.channel.send({
                            embed: {
                                color: defaultcolor,
                                title: `Informations rp de ${member.displayName}`,
                                fields: [
                                    {
                                        name: 'Pseudo rp',
                                        value: rpu.name
                                    },
                                    {
                                        name: 'Description',
                                        value: rpu.description
                                    },
                                    {
                                        name: 'Status',
                                        value: client.getStatus(rpu.rpstatus) || 'Inconnu'
                                    }
                                ],
                                author: {
                                    name: member.displayName,
                                    icon_url: user.displayAvatarURL()
                                },
                                thumbnail: {
                                    url: rpu.avatar,
                                },
                            }
                        });

                    } else if (command === 'status') {
                        let [ updatetype ] = args;

                        const types = [
                            {
                                id: 'alive',
                                description: 'Le personnage est en vie',
                                aliases: ['vie', 'alive', 'vivant'],
                                declarate: 'en vie'
                            },
                            {
                                id: 'dead',
                                description: 'Le personnage est mort',
                                aliases: ['mort', 'dead', 'death'],
                                declarate: 'mort'
                            }
                        ];

                        let content = '';

                        types.forEach(t => {
                            content += `**${t.aliases[0]}** : ${t.description}\n`
                        });

                        if (!updatetype) {
                            return msg.channel.send({
                                embed: {
                                    color: defaultcolor,
                                    title: 'Mettre à jour le status de ton personnage',
                                    description: `Cela permet de changer le status du personnage. Voici les types disponibles :\n\n${content}\nPour ce faire, faites \`\`!rp update <nouveau status>\`\`.\nActuellement, ton personnage est ${types.find(t => t.id == rpuser.rpstatus).declarate}`
                                }
                            });
                        }

                        updatetype = updatetype.toLowerCase();

                        const type = types.find(t => t.aliases.includes(updatetype));

                        if (!type) return msg.channel.send(`${msg.author},`, {
                            embed: {
                                color: refused,
                                title: 'Erreur : type invalide',
                                description: `Voici les types disponibles : \n\n${content}`
                            }
                        });

                        if (type.id === rpuser.rpstatus) return msg.channel.send(`${msg.author}, ton personnage est déjà ${type.declarate}`)

                        const confirmation = await msg.channel.send(`${msg.author},`, {
                            embed: {
                                color: defaultcolor,
                                title: 'Veux-tu changer le status de ton personnage ?',
                                description: `Tu es sur le point de déclarer ton personnage comme ${type.declarate}. Veux-tu vraiment le faire ? Confirme avec ✅. Tu as 1 minute pour le faire`
                            }
                        });

                        const confirmationc = confirmation.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === msg.author.id);

                        confirmationc.on('collect', (reaction, user) => {
                            rpDB.set(msg.author.id, type.id, 'rpstatus');
                            this.changeStatus(type.id, rpuser);
                            msg.channel.send(`${msg.author}, ton personnage a été déclaré comme étant ${type.declarate}`);
                            confirmation.reactions.removeAll();
                        });

                        await confirmation.react('✅');

                    } else if (command === 'leave') {

                        const rmsg = await msg.channel.send({
                            embed: {
                                color: refused,
                                title: 'Voulez-vous vraiment quitter le rp et déclarer mort votre personnage ?',
                                description: 'Ceci est irréversible. Une fois fait, vous n\'aurez plus accès au rp à moins que vous refaisiez une demande. Vous n\'aurez également plus accès à votre personnage, il sera déclaré mort.\nPour confirmer votre choix, réagissez avec ✅ pour confirmer ou ❌ pour annuler. Vous avez 1 minute pour le faire'
                            }
                        });

                        const rcollector = rmsg.createReactionCollector((reaction, user) => reaction.emoji.name === '✅' && user.id === msg.author.id || reaction.emoji.name == '❌' && user.id == msg.author.id, {
                            time: 60000,
                            max: 1
                        });

                        rcollector.on('collect', (reaction, user) => {
                            const emote = reaction.emoji.name;

                            if (emote === '✅') {

                                this.changeStatus('left', rpuser);

                                rpDB.delete(msg.author.id);

                                if (msg.member.roles.cache.has(config.roles.accepted)) msg.member.roles.remove(config.roles.accepted);

                                msg.channel.send(`${msg.author}, vous avez supprimé votre personnage du rp`);

                            } else if (emote === '❌') {

                                msg.channel.send(`${msg.author}, tu as annulé`);

                            }

                        })

                        rcollector.on('end', (collected, reason) => {

                            if (reason == 'time') {
                                msg.channel.send(`${msg.author}, tu as annulé`)
                            }

                            rmsg.reactions.removeAll()

                        })

                        await rmsg.react('✅')
                        await rmsg.react('❌')

                    } else if (command === 'update') {

                        const types = [
                            {
                                id: 'description',
                                description: 'Permet de modifier la description de ton personnage',
                                aliases: ['desc', 'msg', 'déscription']
                            },
                            {
                                id: 'avatar',
                                description: 'Permet de mettre à jour l\'avatar de ton personnage',
                                aliases: ['avatar', 'image', 'pp', 'profilepicture', 'picture']
                            }
                        ]

                        let updateType = args[1] ? args[1].toLowerCase() : args[1]

                        let content = ''

                        types.forEach(type => {
                            content += `**${type.id}** : ${type.description}\n`
                        });

                        const usage = `Utilisation : \`\`!rp update <type>\`\`. Types disponibles :\n\n${content}`

                        if (!updateType) return msg.channel.send({
                            embed: {
                                color: 0x3734eb,
                                title: 'Mettre à jour les informations de ton personnage',
                                description: usage
                            }
                        });


                        const type = types.find(type => type.id.toLowerCase() === updateType || type.aliases.includes(updateType));

                        if (!type) return msg.channel.send({
                            embed: {
                                color: 0x3734eb,
                                title: 'Type invalide',
                                description: usage
                            }
                        });

                        if (type.id.toLowerCase() === 'description') {

                            let newDescription = args[2];

                            if (!newDescription) return msg.channel.send(`${msg.author}, précise une description ! Elle ne devra pas dépasser 1000 caractères`)
                            if (newDescription.length >= 1000) return msg.channel.send(`Désolé ${msg.author} mais la description est trop longue. Elle doit faire moins de 1000 caractères (elle en fait ${newDescription.length})`)

                        } else if (type.id.toLowerCase() === 'avatar') {

                            const attachement = msg.attachments.first();

                            if (!attachement || await client.isImage(attachement?.url)) return msg.channel.send(`${msg.author}, il faut que tu envoies une image en faisant la commande (upload l'image, n'envoie pas de lien)`)

                            const rmsg = await msg.channel.send(`${msg.author},`, {
                                embed: {
                                    color: defaultcolor,
                                    title: 'Changement d\'avatar',
                                    description: 'Voici le nouvel avatar. Réagis avec ✅ pour le changer ou ❌ pour annuler',
                                    image: {
                                        url: attachement.url
                                    },
                                }
                            })

                            const rcollector = rmsg.createReactionCollector((reaction, user) => (reaction.emoji.name == '✅' || reaction.emoji.name == '❌') && user.id == msg.author.id, {
                                time: 60000,
                                max: 1
                            });

                            rcollector.on('collect', async (reaction, user) => {
                                const emote = reaction.emoji.name;

                                if (emote == '✅') {

                                    rpDB.set(msg.author.id, attachement.url, 'avatar');

                                } else if (emote == '❌') {

                                    msg.channel.send(`${msg.author}, tu as annulé`);

                                }

                            })

                            rcollector.on('end', (collected, reason) => {

                                if (reason == 'time') {
                                    msg.channel.send(`${msg.author}, tu as annulé`);
                                }

                                rmsg.reactions.removeAll();

                            })

                            await rmsg.react('✅')
                            await rmsg.react('❌')


                        }


                    }
                } else {
                    this.sendCommands()
                }
            }

        }


    }

    sendCommands = () => {
        let content = '';

        this.cmdlist.forEach(command => {
            if (command.id === 'enter') return;
            content += `\`\`!rp ${command.id}\`\` : ${command.description}\n`;
        })

        return this.lemsg.channel.send(`${this.lemsg.author},`, {
            embed: {
                color: this.defaultcolor,
                title: `Voci les commandes rp que tu peux utiliser`,
                description: content
            }
        })
    }

    changeStatus = async (newStatus, rpuser) => {

        const fichesrp = this.client.channels.cache.get(this.client.config.channels.rpFiches);

        const msgtoedit = await fichesrp.messages.fetch(rpuser.ficheId);

        let embed = msgtoedit.embeds[0];

        embed.fields.splice(2, 1, {
            name: embed.fields[2].name,
            value: this.client.replaceStatus(newStatus)
        });

        msgtoedit.edit({
            embed: embed
        });

    }
}

module.exports = Rp;