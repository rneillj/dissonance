import { Client, Guild, MessageReaction, Role, TextChannel } from "discord.js";

export const client = new Client();

// Specific message IDs to monitor for emoji reactions.
const ROLES = "586568749834829876";

// Role IDs
const SPERGLORDS = "586394644414332954";
const NSFW = "577114059560976384";

// Emojis
const EGGPLANT = "🍆";
const WOW = "wow";

/**
 * Initialize the bot once it has authenticated with Discord.
 */
client.on("ready", async () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

/**
 * React to specific text messages.
 */
client.on("message", (message) => {
    if (message.content === "ping") {
        message.reply("pong!");
    }

    if ((message.content.includes("Thunderfury") || message.content.includes("thunderfury"))
        && message.author.username !== "MrTacoVendor") {
        const emoji = message.guild.emojis.find((e) => e.name === "thunderfury");
        message.react(emoji);
        message.reply("Did someone say [Thunderfury, Blessed Blade of the Windseeker]?");
    }
});

/**
 * Function for fetching a role from a guild.
 *
 * @param {MessageReaction} reaction - A reaction to a message.
 * @param {Guild} guild - A Discord server.
 */
function getRole(reaction: MessageReaction, guild: Guild): Role {
    let role = null;

    switch (reaction.emoji.name) {
        case WOW: {
            role = guild.roles.get(SPERGLORDS);
            break;
        }
        case EGGPLANT: {
            role = guild.roles.get(NSFW);
            break;
        }
        default: {
            console.log("Unable to add role.");
        }
    }

    return role;
}

/**
 * React to adding specific emoji reactions on text messages.
 */
client.on("messageReactionAdd", async (reaction, user) => {
    const guild = reaction.message.guild;
    const guildMember = guild.members.get(user.id);

    if (reaction.message.id === ROLES) {
        const role = getRole(reaction, guild);

        if (role !== null && role !== undefined) {
            try {
                await guildMember.addRole(role);
            } catch (err) {
                console.log(err);
            }
        }
    }
});

/**
 * React to removing specific emoji reactions on text messages.
 */
client.on("messageReactionRemove", async (reaction, user) => {
    const guild = reaction.message.guild;
    const guildMember = guild.members.get(user.id);

    if (reaction.message.id === ROLES) {
        const role = getRole(reaction, guild);

        if (role !== null && role !== undefined) {
            try {
                await guildMember.removeRole(role);
            } catch (err) {
                console.log(err);
            }
        }
    }
});

/**
 * This code block allows the bot to listen for reactions to all messages in all channels, cached or otherwise.
 */
client.on("raw", packet => {
    // We don"t want this to run on unrelated packets
    if (!["MESSAGE_REACTION_ADD", "MESSAGE_REACTION_REMOVE"].includes(packet.t)) {
        return;
    }
    // Grab the channel to check the message from
    const channel = client.channels.get(packet.d.channel_id) as TextChannel;
    // There"s no need to emit if the message is cached, because the event will fire anyway for that
    if (channel.messages.has(packet.d.message_id)) {
        return;
    }
    // Since we have confirmed the message is not cached, let"s fetch it
    channel.fetchMessage(packet.d.message_id).then(message => {
        // Emojis can have identifiers of name:id format, so we have to account for that case as well
        const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
        // This gives us the reaction we need to emit the event properly, in top of the message object
        const reaction = message.reactions.get(emoji);
        // Adds the currently reacting user to the reaction"s users collection.
        if (reaction) {
            reaction.users.set(packet.d.user_id, client.users.get(packet.d.user_id));
        }
        // Check which type of event it is before emitting
        if (packet.t === "MESSAGE_REACTION_ADD") {
            client.emit("messageReactionAdd", reaction, client.users.get(packet.d.user_id));
        }
        if (packet.t === "MESSAGE_REACTION_REMOVE") {
            client.emit("messageReactionRemove", reaction, client.users.get(packet.d.user_id));
        }
    });
});

client.login(process.env.AUTH_TOKEN);
