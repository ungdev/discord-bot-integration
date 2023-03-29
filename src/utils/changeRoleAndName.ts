import { callApi } from './api';
import { log } from './logger';
import { addTeamRole } from './add';
import { renameMember } from './renameMember';

// Function to change a role or a name
export async function changeRoleAndName(member: any, listStudents: any = null, isSync: boolean = false) {
	const { user } = member;
	if (!user.bot) {
		const tag = `${user.username}#${user.discriminator}`;

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
				}
				else {
					if (u.ce === 1) {
						rolesToAdd.push(global.data.rolesList[1]);
						rolesToAdd = rolesToAdd.concat(await addTeamRole(u.team_id));
					}

					if (u.orga === 1) {rolesToAdd.push(global.data.rolesList[2]);}
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
			}
		}
		else if (!isSync) {
			member.send(`Salut <@${user.id}>, tu dois t'inscrire sur le site de l'Intégration (https://integration.utt.fr/) en renseignant ton tag discord pour obtenir tes rôles et avoir accès à tous les channels de discussion !`);
		}
		else {
			log(`${tag} is not in the list`);
		}
	}
}
