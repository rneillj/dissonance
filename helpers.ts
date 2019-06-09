import { Guild, MessageReaction, Role } from "discord.js";
import { CATGIRL_LOVERS, EGGPLANT, FATCAT, NSFW, SPERGLORDS, WOW } from "./constants";

export function isEmpty(value: any): boolean {
    return value === null || value === undefined;
}

/**
 * Function for fetching a role from a guild.
 *
 * @param {MessageReaction} reaction - A reaction to a message.
 * @param {Guild} guild - A Discord server.
 */
export function getRole(reaction: MessageReaction, guild: Guild): Role {
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
        case FATCAT: {
            role = guild.roles.get(CATGIRL_LOVERS);
            break;
        }
        default: {
            console.log("Unable to manage role.");
        }
    }

    return role;
}
