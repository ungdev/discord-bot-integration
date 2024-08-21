import {Role} from "discord.js";

export function getPerms(interaction, roles: Role[], teamRole: Role) {
    const list: any[] = [
        {
            id: interaction.guild.id, // @everyone
            deny: ['ViewChannel'],
        },
        {
            id: teamRole.id, // @everyone
            allow: ['ViewChannel'],
        },
    ]
    for(const role of roles) {
        if(!role) {
            console.log("role null:")
            console.log(role)
            console.log("============")
            continue
        }
        if(role) list.push(
            {
                id: role.id,
                allow: ['ViewChannel'],
            })
    }
    return list
}

export async function getRoleFromName(interaction, name): Promise<Role> {
    return interaction.guild.roles.cache.find(r => r.name === name);
}

export async function getRolesFromNames(interaction, names: string[]) {
    let roles: Role[] = []
    for (let name of names) {
        const role: Role = await getRoleFromName(interaction, name)
        roles.push(role)
    }
    return roles;
}

export async function assignRolesTo(interaction, roles, users) {
    if(!users) return;
    for (const user of users) {
        const member = interaction.guild.members.cache.find(member => member.user.username === user.discord_id);
        if (member) {
            for (const role of roles) {
                await member.roles.add(role);
                console.log(`Rôle ${role.name} attribué à ${member.user.tag}.`);
            }
        } else {
            //Don't log when discord_id is null
            if(!user.discord_id) continue
            //Send message in log chanel
            global.log.send(`L'user avec le mail \`${user.email}\` n'a pas un bon discord id: \`${user.discord_id}\` (ou il n'est pas sur le discord).`);
        }
    }
}

export async function assignRoleTo(interaction, role, users) {
    if(!users) return;
    console.log("-----------------")
    for (const user of users) {
        const member = interaction.guild.members.cache.find(member => member.user.username === user.discord_id);
        if (member) {
            await member.roles.add(role);
            console.log(`Rôle ${role.name} attribué à ${member.user.tag}.`);
        } else {
            //Don't log when discord_id is null
            if(!user.discord_id) continue
            //Send message in log chanel
            global.log.send(`L'user avec le mail \`${user.email}\` n'a pas un bon discord id: \`${user.discord_id}\` (ou il n'est pas sur le discord).`);
            console.error(`Membre avec ID ${user.discord_id} non trouvé pour le role ${role.name}.`);
        }
    }
    console.log("-----------------")
}

export async function removeRoleTo(interaction, role, users) {
    for (const user of users) {
        const member = interaction.guild.members.cache.get(user.discord_id);
        if (member) {
            await member.roles.remove(role);
            console.log(`Rôle ${role.name} attribué à ${member.user.tag}.`);
        } else {
            console.error(`Membre avec ID ${user.discord_id} non trouvé.`);
        }
    }
}