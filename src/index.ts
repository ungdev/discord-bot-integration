// Load the .env file
import path from "path";

require('dotenv').config();

// Utils
import fs from 'fs';

import { Routes } from 'discord-api-types/v10';

// Discord
import {Client, Collection, GatewayIntentBits, Guild, REST} from 'discord.js';
import { error, log } from './utils/logger';

// Commands
import { Commands } from './command';

// Global variables

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
import express, { Request, Response } from 'express';
import interactionCreate from './listeners/interactionCreate';
import guildMemberAdd from './listeners/guildMemberAdd';
import guildMemberUpdate from './listeners/guildMemberUpdate';
import {init} from "./database/init";
import {roleSchema} from "./schemas/role.schema";
import {eq} from "drizzle-orm";
const app = express();
const port = 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('OK');
});

app.get('/db', (req: Request, res: Response) => {
    res.send(JSON.stringify(global.db.JSON()));
});

// Temporary code to get logs
app.get('/logs', (req: Request, res: Response) => {
    fs.readFile(__dirname + '/data/logs.txt', 'utf8', (err, data) => {
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
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
client.once('ready', async () => {
    const logsDir = path.join(__dirname, 'data')
    const logsPath = path.join(logsDir, 'logs.txt')

    // Create 'data' directory if it does not exist
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }

    // Create logs.txt file if not exists
    if (!fs.existsSync(logsPath)) {
        fs.writeFile(logsPath, '', function (err) {
            if (err) {
                error(`${err}`);
            }
        });
    }

    log('Ready!');

    global.data.guild = client.guilds.cache.get(process.env.GUILD_ID || '') as Guild;

    global.data.rolesList = [
        global.data.guild.roles.cache.find((rol: any) => rol.name === process.env.NEWCOMER_ROLE),
        global.data.guild.roles.cache.find((rol: any) => rol.name === process.env.CE_ROLE),
        global.data.guild.roles.cache.find((rol: any) => rol.name === process.env.ORGA_ROLE),
    ];

    global.data.factionsCategoryIds = ["1261293675548377169"];


    //Commands
    global.commands = new Collection()

    for (let command of Commands) {
        if ('data' in command && 'execute' in command) {
            global.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command ${command} is missing a required "data" or "execute" property.`);
        }
    }

    // and deploy your commands!
    await (async () => {
        const update = process.env.UPDATE_SLASH as string
        //If env var "UPDATE_SLASH" is true, we send a request to update slash commands
        if (!update || update !== "true"){
            return
        }

        const token = process.env.BOT_TOKEN as string;
        const clientId = process.env.CLIENT_ID as string;
        const guildId = process.env.GUILD_ID as string;

        // Construct and prepare an instance of the REST module
        const rest = new REST().setToken(token);

        const commands: any[] = []
        try {
            console.log(`Started refreshing ${Commands.length} application (/) commands.`);

            // The put method is used to fully refresh all commands in the guild with the current set
            for (let command of Commands) {
                console.log(command.data.name)
                const t = command.data.toJSON()
                commands.push(t)
            }
            const data: any = await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                {body: commands},
            );

            console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        } catch (error) {
            // And of course, make sure you catch and log any errors!
            console.error(error);
        }
    })();

    client.user?.setPresence({
        activities: [
            {
                name: process.env.BOT_ACTIVITY as string,
            },
        ],
        status: 'online',
    });
});

// Add commands
interactionCreate(client);

// Guild events
guildMemberAdd(client);
guildMemberUpdate(client);

// Login to Discord with your client's token
client.login(process.env.BOT_TOKEN);

init()

// Process events on unhandledException
process.on('uncaughtException', function (err) {
    error('uncaughtException: ' + err);
});
