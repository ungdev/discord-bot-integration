// Load the .env file
require('dotenv').config();

// Load libraries
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

// List Commands
const commands = [
	new SlashCommandBuilder().setName('sync').setDescription('Sync automatically roles'),
].map(command => command.toJSON());

// Register Commands
const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN);

rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
