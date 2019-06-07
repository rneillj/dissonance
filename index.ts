import { Client, TextChannel } from "discord.js";

const THUMBSUP_ROLE = "586352500454588416";
const MESSAGE = "586306190238154758";

export const client = new Client();

client.on("ready", async () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

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

client.on("messageReactionAdd", async (reaction, user) => {
    const guild = reaction.message.guild;
    const guildMember = guild.members.get(user.id);
    const thumbsUpRole = guild.roles.get(THUMBSUP_ROLE);

    if (reaction.message.id === MESSAGE) {
        if (reaction.emoji.name === "👍") {
            try {
                await guildMember.addRole(thumbsUpRole);
            } catch (err) {
                console.log(err);
            }
        }
    }
});

client.on("messageReactionRemove", async (reaction, user) => {
    const guild = reaction.message.guild;
    const guildMember = guild.members.get(user.id);
    const thumbsUpRole = guild.roles.get(THUMBSUP_ROLE);

    if (reaction.message.id === MESSAGE) {
        if (reaction.emoji.name === "👍") {
            try {
                await guildMember.removeRole(thumbsUpRole);
            } catch (err) {
                console.log(err);
            }
        }
    }
});

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
