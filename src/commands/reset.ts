import {
    CategoryChannel, ChannelType,
    GuildMember,
    Interaction,
    Role,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder
} from "discord.js";
import {log, error} from "../utils/logger";
import {getPerms, getRoleFromName} from "./utils/roles";
import {db} from "../database/db";
import {teamSchema} from "../schemas/team.schema";
import {createError} from "./utils/error-embed";

export const ResetCommand: { data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder; execute(interaction): Promise<void> } = {
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Reset roles given by the bot, roles and channels'),
    async execute(interaction) {
        await interaction.reply('Reset in progress...');

        //First check if user is 'Super Orga'

        /* Check if user has permission to use the command */
        //Get user

        const user = interaction.member;
        //Check coord role

        const hasCoordRole = user.roles.cache.some(role => role.name === process.env.COORDS_ROLE);
        if (!hasCoordRole) {
            console.log(`User ${user.user.username} does not have the Coord role.`);
            return interaction.followUp({ embeds: [createError("You don't have permission to use this command.")] });
        }

        console.log(`User ${user.user.username} do have the Coord role.`);
        log('Reset started!');
        await reset(interaction);
        await interaction.followUp({ content: 'Reset done!' });
        log('Reset done!');
    },
};

async function findCategories(interaction, categories) {
    let list: any[] = []
    for (let category of categories) {
        console.log("find " + category)
        let t = interaction.guild.channels.cache.find(c => c.name === category && c.type === ChannelType.GuildCategory);
        list.push(t)
    }
    return list
}

export async function reset(interaction) {

    //Getting categories
    const categories = [ process.env.FUTUR_CATEGORY, process.env.PAST_CATEGORY ]
    const categoryMap = await findCategories(interaction, categories);
    await deleteChanelsIn(interaction, categoryMap)
    await deleteCategories(interaction, categoryMap)

    //Delete roles
    await deleteRoles(interaction)
    //remove CE, ORGA roles
    await removeRoles(interaction, [process.env.COORDS_ROLE as string])
}

export async function deleteChanelsIn(interaction, categoryMap) {
    for (const category of categoryMap) {
        //in case channels are already deleted
        if(!category) continue;
        const categoryId = category.id;

        // Getting every channels in category
        const channelsInCategory = interaction.guild.channels.cache.filter(channel => channel.parentId === categoryId);

        // Delete
        for (const channel of channelsInCategory.values()) {
            try {
                await channel.delete();
                console.log(`Canal ${channel.name} supprimé.`);
            } catch (error) {
                console.error(`Erreur lors de la suppression du canal ${channel.name}:`, error);
                return interaction.followUp({ embeds: [createError("Error: Internal error.")] });
            }
        }
    }
}

export async function deleteCategories(interaction, categoryMap) {
    for (const category of categoryMap) {
        //in case channels are already deleted
        if(!category) continue;
        const categoryId = category.id;
        const categoryChannel = interaction.guild.channels.cache.get(categoryId);
        if (categoryChannel) {
            await categoryChannel.delete();
            console.log(`Catégorie ${categoryChannel.name} supprimée.`);
        } else {
            console.error(`La catégorie avec ID ${categoryId} n'a pas été trouvée ou n'est pas une catégorie.`);
            return interaction.followUp({ embeds: [createError(`Error: No category with id ${categoryId}.`)] });
        }
    }
}

async function deleteRoles(interaction: Interaction) {
    //Getting every teams
    const teams = await db.select().from(teamSchema);
    const teamNames: string[] = teams.map(team => team.name)
    //Delete every team roles
    for (let teamName of teamNames) {
        const role = interaction.guild?.roles.cache.find(r => r.name === teamName);
        if(!role) {
            continue
        }
        await role.delete()
    }
}

async function removeRoles(interaction, blacklist: string[]) {
    console.log("remove roles")
    const guild = interaction.guild;
    if(!guild) {
        console.log("no guild")
        return interaction.followUp({ embeds: [createError(`Error: No guild.`)] });
    }
    const members = await guild.members.cache;
    const botMember = await guild.members.fetchMe();
    const botRoles = botMember.roles.cache;
    for (const member of members.values()) {
        console.log("remove roles of " + member.user.tag)
        if (member.user.bot) continue; // Skip bots

        for (const role of member.roles.cache.values()) {
            if (!blacklist.includes(role.name)) {
                try {
                    await member.roles.remove(role);
                } catch (error: any) {
                    console.error(`Failed to remove role ${role.name} from ${member.user.tag}: ${error.message}`);
                }
            }
        }
    }
    interaction.reply('Roles removed for members not in the blacklist.');
}