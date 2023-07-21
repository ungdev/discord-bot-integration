import { Guild, Role } from 'discord.js';

declare global {
    var data: {
        bearer: any;
        bearerConfig: any;
        guild: Guild?;
        factions: any;
        teams: any;
        rolesList: List<Role>;
        rolesCreatedIds: List<bigint>;
        factionsCategoryIds: List<bigint>;
    };
    var db: any;
}

export {};
