import { ChannelType, GuildMember, OverwriteResolvable, PermissionsBitField, Role } from 'discord.js';
import { callApi } from './api';
import { log, error } from './logger';

// Add Faction and team Role for newcomers and ce
export async function addTeamRole(teamId: number) {
    if (teamId === null) {
        return [];
    }

    const team = await callApi(teamId);

    return [
        global.data.guild?.roles.cache.find((rol: any) => rol.name.toLowerCase().trim() === team.name.toLowerCase().trim()),
        global.data.guild?.roles.cache.find((rol: any) => rol.name.toLowerCase().trim() === team.faction_name.toLowerCase().trim()),
    ];
}

// Create a Category
export async function addCategory(name: string) {
    const category = await global.data.guild?.channels.create({
        name: name,
        type: ChannelType.GuildCategory,
        position: 0,
    }).catch(err => error("Failed to create category " + name + " :\n" + err));
    global.data.factionsCategoryIds.push(category?.id);
    global.db.set('factions', global.data.factionsCategoryIds);
    return category;
}

// Create a Channel and add it to a Category
export async function addChannel(team: any, cat: any) {
    log('Start channel creation for team ' + team.name);
    const permissionOverwrites = [] as Array<OverwriteResolvable>;

    // Modify permissions for the team role and disable view for everyone
    const listRolesCanView = [process.env.COORDS_ROLE, process.env.CE_RESPO, process.env.DEV_ROLE];

    listRolesCanView.map(async (role: string | undefined) => {
        if(role === undefined) {
            log("Role is undefined");
            return;
        }

        const roleToAdd: Role | undefined = global.data.guild?.roles.cache.find((rol: Role) => rol.name.toLowerCase() === role.toLowerCase());

        if (roleToAdd === undefined) {
            error("Role " + role + " has no id");
            return;
        }
        
        permissionOverwrites.push({
            id: roleToAdd,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
        });
    });

    const roleToAdd: Role | undefined = global.data.guild?.roles.cache.find((rol: Role) => (rol.name.toLowerCase().trim() === (team.name as string).toLowerCase().trim()));

    if(roleToAdd === undefined){
        error("Role " + team.name + " has no id");
        return;
    }

    permissionOverwrites.push({
        id: roleToAdd,
        allow:  [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
    });

    if(global.data.guild?.id === undefined){
        error("Guild has no id");
        return;
    }

    permissionOverwrites.push({
        id: global.data.guild?.id,
        deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
    });

    await global.data.guild?.channels.create({
        name: team.name,
        type: ChannelType.GuildText,
        permissionOverwrites: permissionOverwrites,
        parent: cat.find((c: any) => c.name.toLowerCase() === team.faction.name.toLowerCase()).id,
        position: 0,
    }).catch(err => error("Failed to create channel " + team.name + " :\n" + err));

    log('Channel created for team ' + team.name);
}

// Create a Guild Role
export async function addRole(roleName: string) {
    await global.data.guild?.roles
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
        .catch((err: any) => {
            error(`Failed to create role ${roleName}:\n${err}`);
        });
}

// Function to change a role or a name
export async function changeRoleAndName(member: GuildMember, listStudents: any = null, isSync = false, indexText = '') {
    const { user } = member;
    if (!user.bot) {
        // If the discriminator is "0", the user has made the migration to the new system of discord
        const tag = user.discriminator === '0' ? user.username : `${user.username}#${user.discriminator}`;

        // Get students list from API if not already provided
        if (listStudents === null) {
            listStudents = await callApi();
        }

        const userSite = listStudents.filter((o: any) => o.discord === tag);

        if (userSite.length === 1) {
            // The user did connect let's add role and change name
            const u = userSite[0];

            // Can't change owner's name
            if (member.user.id !== global.data.guild?.ownerId) {
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
                await member.roles.remove(global.data.rolesList).catch(
                    (err: any) => {
                        error('Remove roles failed for ' + member.user.username + ' :\n' + err);
                    }
                );

                // Add new roles
                await member.roles.add(rolesToAdd).catch(
                    (err: any) => {
                        error('Add roles failed for ' + member.user.username + ' :\n' + err);
                    }
                );

                /* -----------------------------
							RENAME
				----------------------------- */
                if (rolesToAdd[0] !== undefined) {
                    // await renameMember(member, u, rolesToAdd[0].name)
                    await renameMember(member, u);
                }

                log(`${indexText} ${tag} has been updated`);
            }
        } else if (!isSync) {
            member.send(
                `Salut <@${user.id}>, tu dois t'inscrire sur le site de l'Intégration (https://integration.utt.fr/) en renseignant ton tag discord pour obtenir tes rôles et avoir accès à tous les channels de discussion !`,
            );
        } else {
            log(`${indexText} ${tag} is not in the list`);
        }
    }
}

// Rename user to [Prénom NOM - Role] now replaced by [Prénom NOM]
// export async function renameMember(member: any, userSite: any, roleName: any) {
export async function renameMember(member: any, userSite: any) {
    let firstName = userSite.first_name
        .toLowerCase()
        .replace(/\w\S*/g, (w: any) => w.replace(/^\w/, (c: any) => c.toUpperCase()));
    // Remove too long last name
    const lastName = userSite.last_name.toUpperCase(); //.split(/[-\s]/)[0];

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

    await member.setNickname(name).catch((err: any) => {
        error('Rename failed for ' + member.user.username + ' :\n' + err);
    });
}
