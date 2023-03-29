// Load the .env file
require('dotenv').config();

// Discord
import { Client, Intents } from "discord.js";
import { log } from "./utils/logger";

// Commands
import { Commands } from "./command";

// Database
const jsonDb = require('simple-json-db');

// Server
import express, { Request, Response } from "express";
const app = express();
const port = 3000;

app.get('/', (req: Request, res: Response) => {
	res.send('OK !');
});

app.get('/db', (req: Request, res: Response) => {
	res.send(JSON.stringify(db.JSON()));
});

app.listen(port);

// Global variables
var db = new jsonDb('storage.json');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });

// When the client is ready, run this code (only once)

client.once('ready', async () => {
    log('Ready!');

    // Register commands
    await client.application?.commands.set(Commands);

    data.guild = client.guilds.cache.get(process.env.GUILD_ID || '');

    client.user?.setPresence({
        activities: [{
            name: process.env.BOT_ACTIVITY,
        }],
        status: 'online',
    });

    data.rolesList = [
        data.guild.roles.cache.find((rol: any) => rol.name === process.env.NEWCOMER_ROLE), 
        data.guild.roles.cache.find((rol: any) => rol.name === process.env.CE_ROLE), 
        data.guild.roles.cache.find((rol: any) => rol.name === process.env.ORGA_ROLE)
    ];

    data.rolesCreatedIds = db.has('roles') ? db.get('roles') : [];
    data.factionsCategoryIds = db.has('factions') ? db.get('factions') : [];
});



// Login to Discord with your client's token
client.login(process.env.BOT_TOKEN);
