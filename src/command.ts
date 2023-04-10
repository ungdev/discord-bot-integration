import { CommandInteraction, ChatInputApplicationCommandData, Client } from 'discord.js';
import { Create } from './commands/create';
import { Sync } from './commands/sync';
import { Reset } from './commands/reset';

export interface Command extends ChatInputApplicationCommandData {
    run: (client: Client, interaction: CommandInteraction) => void;
}

export const Commands: Command[] = [Create, Sync, Reset];
