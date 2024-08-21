import {Guild, GuildMember, Interaction} from "discord.js";


function hasRole(interaction, roleNames: string[]): boolean {
    // Check role
    const guild: Guild = interaction.guild as Guild
    const member = interaction.member as GuildMember

    return roleNames.some(roleName => {
        const role = guild.roles.cache.find(r => r.name === roleName);
        return role ? member.roles.cache.has(role.id) : false;
    });
}

export function isOrga(interaction: Interaction): boolean {
    return hasRole(interaction, [process.env.ORGA_ROLE as string, process.env.COORDS_ROLE as string])
}

export function isCe(interaction: Interaction): boolean {
    return hasRole(interaction, [process.env.CE_ROLE as string, process.env.ORGA_ROLE as string, process.env.COORDS_ROLE as string])
}

export function isOnlyCe(interaction: Interaction): boolean {
    return hasRole(interaction, [process.env.CE_ROLE as string])
}