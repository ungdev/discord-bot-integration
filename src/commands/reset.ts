import { log } from '../utils/logger';
import { BaseCommandInteraction, Client } from "discord.js";
import { Command } from "../command";

export const Reset: Command = {
    name: "reset",
    description: "Reset roles given by the bot, roles and channels",
    run: async (client: Client, interaction: BaseCommandInteraction) => {
		await interaction.reply('Reset in progress...');
		await reset();
		await interaction.followUp({ content: 'Reset done!' });
		log('Reset done!');
    }
};

async function reset() {
	// Get all members of the guild
	const members = await data.guild.members.fetch();
	await Promise.all(members.map(async (member: any) => {
		// Can't change owner's name
		if (member.user.id !== data.guild.ownerId) {
			/* -----------------------------
						REMOVE ROLES
			----------------------------- */

			const rolesList = [process.env.NEWCOMER_ROLE, process.env.CE_ROLE, process.env.ORGA_ROLE];

			// Remove old roles
			rolesList.forEach(string => {
				const role = data.guild.roles.cache.find((rol: any) => rol.name === string);
				if (role === undefined) {
					log(`Role "${string}" doesn't exist in this guild!`);
				}
				else {
					member.roles.remove(role).catch((error: any) => {
						error(error);
					});
				}
			});
		}
	}));

	await Promise.all(data.factionsCategoryIds.map(async (categoryId: number) => {
		try {
			const category = await data.guild.channels.cache.get(categoryId);
			await Promise.all(category.children.map(async (channel: any) => {
				try {
					await channel.delete();
				}
				catch (error: any) {
					error(error);
				}
			}));

			await category.delete();
		}
		catch (error: any) {
			error(error);
		}

		data.factionsCategoryIds.splice(data.factionsCategoryIds.indexOf(categoryId), 1);
	}));

	await Promise.all(data.rolesCreatedIds.map(async (roleId: number) => {
		// Remove and handle error
		try {
			await data.guild.roles.cache.get(roleId).delete();
		}
		catch (error: any) {
			error(error);
		}

		data.rolesCreatedIds.splice(data.rolesCreatedIds.indexOf(roleId), 1);
	}));

	db.set('roles', []);
	db.set('factions', []);
}