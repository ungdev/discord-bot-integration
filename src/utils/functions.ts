import { callApi } from './api';
import { log } from './logger';

// Add Faction and team Role for newcomers and ce
export async function addTeamRole(teamId: number) {
    if (teamId === null) {
        return [];
    }

    const team = await callApi(teamId);

    return [
        global.data.guild.roles.cache.find((rol: any) => rol.name === team.name),
        global.data.guild.roles.cache.find((rol: any) => rol.name === team.faction_name),
    ];
}

// Create a Category
export async function addCategory(name: string) {
    const category = await global.data.guild.channels.create(name, {
        type: 'GUILD_CATEGORY',
        permissions: [
            'VIEW_CHANNEL',
            'SEND_MESSAGES',
            'READ_MESSAGES',
            'MANAGE_MESSAGES',
            'MANAGE_ROLES',
            'MANAGE_CHANNELS',
        ],
        position: 0,
    });
    global.data.factionsCategoryIds.push(category.id);
    global.db.set('factions', global.data.factionsCategoryIds);
    return category;
}

// Create a Channel and add it to a Category
export async function addChannel(team: any, cat: any) {
    const channel = await global.data.guild.channels.create(team.name, {
        type: 'text',
        permissions: [
            'VIEW_CHANNEL',
            'SEND_MESSAGES',
            'READ_MESSAGES',
            'MANAGE_MESSAGES',
            'MANAGE_ROLES',
            'MANAGE_CHANNELS',
        ],
        position: 0,
    });

    await channel.setParent(cat.find((c: any) => c.name.toLowerCase() === team.faction.name.toLowerCase()).id);

    // Modify permissions for the team role and disable view form everyone
    const listRolesCanView = [process.env.COORDS_ROLE, process.env.CE_RESPO, process.env.DEV_ROLE];
    await Promise.all(
        listRolesCanView.map(async (role) => {
            await channel.permissionOverwrites.edit(
                global.data.guild.roles.cache.find((rol: any) => rol.name === role).id,
                {
                    VIEW_CHANNEL: true,
                },
            );
        }),
    );

    try {
        await channel.permissionOverwrites.edit(
            global.data.guild.roles.cache.find(
                (rol: any) => rol.name.toLowerCase().trim() === team.name.toLowerCase().trim(),
            ).id,
            {
                VIEW_CHANNEL: true,
            },
        );
    } catch (error: any) {
        error(error);
    }

    await channel.permissionOverwrites.edit(global.data.guild.id, {
        VIEW_CHANNEL: false,
    });
}

// Create a Guild Role
export async function addRole(roleName: string) {
    await global.data.guild.roles
        .create({
            name: roleName,
            color: '#000000',
            mentionable: true,
            hoist: true,
        })
        .then((created: any) => {
            log(`Created role ${created.name}`);
            global.data.rolesCreatedIds.push(created.id);
            global.db.set('roles', global.data.rolesCreatedIds);
            return 0;
        })
        .catch(console.error);
}

// Function to change a role or a name
export async function changeRoleAndName(member: any, listStudents: any = null, isSync = false) {
    const { user } = member;
    if (!user.bot) {
        const tag = `${user.username}#${user.discriminator}`;

        // Get students list from API if not already provided
        if (listStudents === null) {
            listStudents = await callApi();
        }

        const userSite = listStudents.filter((o: any) => o.discord === tag);

        if (userSite.length === 1) {
            // The user did connect let's add role and change name
            const u = userSite[0];

            // Can't change owner's name
            if (member.user.id !== global.data.guild.ownerId) {
                /* -----------------------------
							ADD ROLES
				----------------------------- */

                let rolesToAdd: any[] = [];
                if (u.is_newcomer === 1) {
                    rolesToAdd.push(global.data.rolesList[0]);
                    rolesToAdd = rolesToAdd.concat(await addTeamRole(u.team_id));
                } else {
                    if (u.ce === 1) {
                        rolesToAdd.push(global.data.rolesList[1]);
                        rolesToAdd = rolesToAdd.concat(await addTeamRole(u.team_id));
                    }

                    if (u.orga === 1) {
                        rolesToAdd.push(global.data.rolesList[2]);
                    }
                }

                // Remove old roles
                await member.roles.remove(global.data.rolesList).catch(console.error);

                // Add new roles
                await member.roles.add(rolesToAdd).catch(console.error);

                /* -----------------------------
							RENAME
				----------------------------- */
                if (rolesToAdd[0] !== undefined) {
                    await renameMember(member, u, rolesToAdd[0].name);
                }

                log(`${tag} has been updated`);
            }
        } else if (!isSync) {
            member.send(
                `Salut <@${user.id}>, tu dois t'inscrire sur le site de l'Intégration (https://integration.utt.fr/) en renseignant ton tag discord pour obtenir tes rôles et avoir accès à tous les channels de discussion !`,
            );
        } else {
            log(`${tag} is not in the list`);
        }
    }
}

// Rename user to [Prénom NOM - Role]
export async function renameMember(member: any, userSite: any, roleName: any) {
    let firstName = userSite.first_name
        .toLowerCase()
        .replace(/\w\S*/g, (w: any) => w.replace(/^\w/, (c: any) => c.toUpperCase()));
    // Remove too long last name
    const lastName = userSite.last_name.toUpperCase().split(/[-\s]/)[0];

    // Je veux bien dev le bot de l'inté par contre on respecte mon prénom, merci
    if (firstName === 'Noe') firstName = 'Noé';

    let name = firstName + ' ' + lastName;

    // 32 characters is the maximum length of a discord name
    const maxChar = 32;
    // if the role name is displayed, we need to remove 3 characters + the length of the role name
    // const maxChar = 32 - 3 - roleName.length;

    // If too long name then remove some chars
    if (name.length > maxChar) {
        name = name.substring(0, maxChar);
    }

    // const roleSuffix = (roleName === null) ? '' : ' - ' + roleName;

    await member.setNickname(name).catch((error: any) => {
        error(error);
    });
}