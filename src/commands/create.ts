import { log } from '../utils/logger';
import { callApi } from '../utils/api';
import { addRole, addCategory, addChannel } from '../utils/functions';
import { CommandInteraction, Client, ApplicationCommandType } from 'discord.js';
import { Command } from '../command';

export const Create: Command = {
    name: 'create',
    description: 'Create roles and channels for each teams',
    type: ApplicationCommandType.ChatInput,
    run: async (client: Client, interaction: CommandInteraction) => {
        log('Creation of channels and roles started!');
        await interaction.reply('Creation in progress...');
        await create();
        await interaction.followUp({ content: 'Creation done!' });
        log('Creation done!');
    },
};

// Create roles for the factions and the teams
async function create() {
    await callApi();
    const cat = new Array();

    await Promise.all(
        global.data.factions.map(async (faction: any) => {
            await addRole(faction.name);
            cat.push(await addCategory(faction.name));
        }),
    );

    await Promise.all(
        log(`Test 1`);
        global.data.teams.map(async (team: any) => {
            log(`Test 2`);
            if (team.name !== undefined && team.name !== null && team.name !== '') {
                log(`Team ${team.name}`);
                await addRole(team.name);
                await addChannel(team, cat);
            }
        }),
    );
}
