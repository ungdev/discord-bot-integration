import { log } from '../utils/logger';
import { callApi } from '../utils/api';
import { addRole, addCategory, addChannel } from '../utils/add';
import { BaseCommandInteraction, Client } from "discord.js";
import { Command } from "../command";

export const Create: Command = {
    name: "create",
    description: "Create roles and channels for each teams",
    run: async (client: Client, interaction: BaseCommandInteraction) => {
		await interaction.reply('Creation in progress...');
		await create();
		await interaction.followUp({ content: 'Creation done!' });
		log('Creation done!');
    }
};


// Create roles for the factions and the teams
async function create() {
	await callApi();
	const cat = new Array();

	await Promise.all(data.factions.map(async (faction: any) => {
		await addRole(faction.name);
		cat.push(await addCategory(faction.name));
	}));

	await Promise.all(data.teams.map(async (team: any) => {
		if (team.name !== undefined && team.name !== null && team.name !== '') {
			log(`Team ${team.name}`);
			await addRole(team.name);
			await addChannel(team, cat);
		}
	}));
}