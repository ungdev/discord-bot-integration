import {SlashCommandBuilder} from '@discordjs/builders';
import {createError} from "./utils/error-embed";
import {ChannelType, Role, SlashCommandSubcommandsOnlyBuilder} from "discord.js";
import {db} from "../database/db";
import {teamSchema} from "../schemas/team.schema";
import {SelectResult} from "drizzle-orm/query-builders/select.types";
import {assignRolesTo, assignRoleTo, getPerms, getRoleFromName, getRolesFromNames} from "./utils/roles";
import {userSchema} from "../schemas/user.schema";
import {eq} from "drizzle-orm";

/*
créer deux catégorie "Passé" et "Futur"
créer tous les chans d'équipe dans leur catégorie respective (c'est en db)
créer un rôle par équipe qui a accès au chanel
récupérer la liste des membres
leur attribuer le rôle correspondant en fonction de leur permission en db (Student avec teamId == CE, NewStudent == nouveau)
 */

export const Create: { data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder; execute(interaction): Promise<void> } = {
    data: new SlashCommandBuilder()
        .setName('create')
        .setDescription('Create everything needed for integration [Categories, Chanels, Roles].')
        ,
    async execute(interaction) {
        await interaction.reply('Creation in progress...');
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

        //Getting "Nouveau role"
        const newRole = await getRoleFromName(interaction, process.env.NEWCOMER_ROLE);
        if(!newRole) {
            console.log(`No 'Nouveau' role.`);
            return interaction.followUp({ embeds: [createError("The role 'Nouveau does not exist'.")] });
        }

        //Setting categories
        const categories = [ process.env.FUTUR_CATEGORY, process.env.PAST_CATEGORY ]

        //Get role that has access to every channel
        const bypassRoles = await getRolesFromNames(interaction, [process.env.CE_RESPOas as string, process.env.COORDS_ROLE as string]);

        // Vérifier et créer les catégories si elles n'existent pas
        const categoryMap = await createCategories(interaction, categories);

        //Getting every different teams name and their faction
        const teams = await db.select().from(teamSchema);
        if (!teams || teams.length === 0) return interaction.followUp({ embeds: [createError("No teams found.")] });
        for (const team of teams) {
            console.log("=======================" + team.name + "=======================")
            const teamRole = await createTeam(interaction, team);
            console.log("=======================")
            const teamChanel = await createChanel(interaction, team, categoryMap, bypassRoles, teamRole);
            console.log("=======================")
            const teamMembers = await getTeamMembers(interaction, team);
            console.log("=======================")
            console.log("Team members:")
            //need to assign "Nouveau" role to users
            await assignRolesTo(interaction, [teamRole, newRole], teamMembers);
            //await assignRoleTo(interaction, newRole, teamMembers);
            console.log("==============================================")
        }

        return await interaction.followUp({ content: 'Creation done!' });

    },
};

async function createCategories(interaction, categories: any[]) {
    const categoryMap = new Map();
    //Loop over the two categories
    for (const categoryName of categories) {
        let category = interaction.guild.channels.cache.find(c => c.name === categoryName && c.type === ChannelType.GuildCategory);

        if (!category) {
            category = await interaction.guild.channels.create({
                name: categoryName,
                type: ChannelType.GuildCategory
            });
            console.log(`Catégorie ${categoryName} créée.`);
        } else {
            console.log(`Catégorie ${categoryName} existe déjà.`);
        }

        categoryMap.set(categoryName, category);
    }
    return categoryMap
}

async function createChanel(interaction, team, categoryMap, bypassRoles: Role[], teamRole: Role) {
    //Checking which faction

    //Check 0 => Passé and 1 => Futur
    const categoryName = team.faction === 0 ? process.env.PAST_CATEGORY : process.env.FUTUR_CATEGORY;
    const category = categoryMap.get(categoryName);
    //Check category exist
    if(!category) {
        return interaction.followUp({ embeds: [createError("Error: Categories 'Passé' and 'Futur' not existing.")] });
    }
    // Check chanel exist or not
    const existingChannel = interaction.guild.channels.cache.find(channel =>
        channel.name === team.name.replace(" ", "-") &&
        channel.parentId === category.id &&
        channel.type === ChannelType.GuildText
    );
    if (existingChannel) {
        console.log("chanel " + team.name + " existe")
        return existingChannel;
    }
    // Create chanel
    console.log("chanel " + team.name + " existe pas")
    return await interaction.guild.channels.create({
        name: team.name,
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: getPerms(interaction, bypassRoles, teamRole)
    });
}

async function createTeam(interaction, team): Promise<any> {
    // Vérifier si le rôle existe déjà
    const existingRole = interaction.guild.roles.cache.find(role => role.name === team.name);
    if (existingRole) {
        console.log(`Rôle ${team.name} déjà crée.`);
        return existingRole;
    }

    // Créer le rôle pour chaque équipe
    const role = await interaction.guild.roles.create({
        name: team.name,
        color: 'Random', // Couleur RGB aléatoire
        reason: `Rôle créé pour l'équipe ${team.name}`
    });

    console.log(`Rôle ${team.name} créé avec la couleur random.`);
    return role;
}

async function getTeamMembers(interaction, team): Promise<any> {
    //Getting every different members in the team
    const users = await db.select().from(userSchema).where(eq(userSchema.team, team.id));

    //loop to add CE role to CEs
    //a student is a CE if 'permission' is equal to Student and if he has a teamId
    //so just need to check if 'permission' is Student and team id is the same as id
    for (const user of users) {
        if (user.permission === 'Student' && user.team === team.id) {
            await assignRoleTo(interaction, await getRoleFromName(interaction, process.env.CE_ROLE), [user])
        }
    }

    return users
}