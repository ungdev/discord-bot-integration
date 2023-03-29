import { BaseCommandInteraction, ChatInputApplicationCommandData, Client } from "discord.js";
import { Create } from "./commands/create";
import { Sync } from "./commands/sync";
import { Reset } from "./commands/reset";

export interface Command extends ChatInputApplicationCommandData {
    run: (client: Client, interaction: BaseCommandInteraction) => void;
}

export const Commands: Command[] = [Create, Sync, Reset];