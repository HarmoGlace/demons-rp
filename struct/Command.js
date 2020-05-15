const { Command: AkairoCommand } = require('discord-akairo');

class Command extends AkairoCommand {

    constructor(id, options = {}) {

        super(id, options);

        const {
            aliases = [],
            args = this.args || [],
            quoted = true,
            separator,
            channel = null,
            ownerOnly = false,
            editable = true,
            typing = false,
            cooldown = null,
            ratelimit = 1,
            location = 'guild',
            teamsNeeded,
            argumentDefaults = {},
            description = '',
            prefix = this.prefix,
            clientPermissions = this.clientPermissions,
            userPermissions = this.userPermissions,
            regex = this.regex,
            condition = this.condition || (() => false),
            before = this.before || (() => undefined),
            lock,
            ignoreCooldown,
            ignorePermissions,
            flags = [],
            optionFlags = []
        } = options;

        this.location = location;


    }


}

module.exports = Command;