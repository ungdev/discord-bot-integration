// Load the .env file
require('dotenv').config();

// Utils
import fs from 'fs';

// Discord
import { Client, GatewayIntentBits } from "discord.js";
import { error, log } from "./utils/logger";

// Commands
import { Commands } from "./command";

// Database
import jsonDb from 'simple-json-db';

// Global variables
global.db = new jsonDb(__dirname + '/storage.json');

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

// Temporary code
app.get('/logs', (req: Request, res: Response) => {
    fs.readFile(__dirname + '/logs.txt', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.send(err);
            return;
        }
        // ln2br
        data = data.replace(/\n/g, '<br>');
        res.send(data);
    });
});

app.listen(port);

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

// When the client is ready, run this code (only once)

client.once('ready', async () => {
    log('Ready!');

    // Create logs.txt file if not exists
    if (!fs.existsSync(__dirname + '/logs.txt')) {
        fs.writeFile(__dirname + '/logs.txt', '', function (err) {
            if (err) {
                error(`${err}`);
            }
        });
    }

    // Sync JSON DB with local file
    try {
        global.db.sync();
    } catch (e) {
        error('Error while syncing JSON DB: ' + e);
    }
    

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
