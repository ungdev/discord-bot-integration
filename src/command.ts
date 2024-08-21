import {
    CommandInteraction,
    ChatInputApplicationCommandData,
    Client,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder, SlashCommandSubcommandsOnlyBuilder
} from 'discord.js';
import {PingCommand} from "./commands/test";
import {ResetCommand} from "./commands/reset";
import {Team} from "./commands/team";
import {Create} from "./commands/create";

export interface Command extends ChatInputApplicationCommandData {
    run: (client: Client, interaction: CommandInteraction) => void;
}

export const Commands: { data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder; execute(interaction): Promise<void> }[] =
    [PingCommand, ResetCommand, Team, Create];
