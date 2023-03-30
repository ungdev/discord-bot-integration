// Load the .env file
require('dotenv').config();

// Discord
import { Client, Intents } from "discord.js";
import { log } from "./utils/logger";

// Commands
import { Commands } from "./command";

// Database
const jsonDb = require('simple-json-db');

// Global variables
global.db = new jsonDb('storage.json');

global.data = {
    bearer: null,
    bearerConfig: null,
    guild: null,
    factions: null,
    teams: null,
    rolesList: [],
    rolesCreatedIds: [],
    factionsCategoryIds: [],
};

// Server
import express, { Request, Response } from "express";
import interactionCreate from "./listeners/interactionCreate";
import guildMemberAdd from "./listeners/guildMemberAdd";
import guildMemberUpdate from "./listeners/guildMemberUpdate";
const app = express();
const port = 3000;

app.get('/', (req: Request, res: Response) => {
	res.send('OK !');
});

app.get('/db', (req: Request, res: Response) => {
	res.send(JSON.stringify(global.db.JSON()));
});

app.listen(port);

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });

// When the client is ready, run this code (only once)

client.once('ready', async () => {
    log('Ready!');

    // Register commands
    await client.application?.commands.set(Commands);

    global.data.guild = client.guilds.cache.get(process.env.GUILD_ID || '');

    client.user?.setPresence({
        activities: [{
            name: process.env.BOT_ACTIVITY,
        }],
        status: 'online',
    });

    global.data.rolesList = [
        global.data.guild.roles.cache.find((rol: any) => rol.name === process.env.NEWCOMER_ROLE), 
        global.data.guild.roles.cache.find((rol: any) => rol.name === process.env.CE_ROLE), 
        global.data.guild.roles.cache.find((rol: any) => rol.name === process.env.ORGA_ROLE)
    ];

    global.data.rolesCreatedIds = global.db.has('roles') ? global.db.get('roles') : [];
    global.data.factionsCategoryIds = global.db.has('factions') ? global.db.get('factions') : [];
});

// Add commands
interactionCreate(client);

// Guild events
guildMemberAdd(client);
guildMemberUpdate(client);

// Login to Discord with your client's token
client.login(process.env.BOT_TOKEN);
