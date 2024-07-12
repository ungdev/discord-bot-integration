import {
    CommandInteraction,
    ChatInputApplicationCommandData,
    Client,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder, SlashCommandSubcommandsOnlyBuilder
} from 'discord.js';
import { Create } from './commands/test/create';
import { Sync } from './commands/test/sync';
import {PingCommand} from "./commands/test";
import {ResetCommand} from "./commands/reset";
import {Team} from "./commands/team";

export interface Command extends ChatInputApplicationCommandData {
    run: (client: Client, interaction: CommandInteraction) => void;
}

export const Commands: { data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder; execute(interaction): Promise<void> }[] =
    [PingCommand, ResetCommand, Team];
