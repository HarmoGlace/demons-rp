const config = {
    owners: [], // array of string, IDs of owners
    serverId: '', // string, server id
    channels: { // channels config, use IDs
        rpverif: '' // string, channel id where all rp requests are sent
    },
    roles: { // roles config, use Ids, strings only
        accepted: '' // string, accepted rp role
    },
    token: '' // string, bot token
}

module.exports = config;