import { Guild, Role } from 'discord.js';

declare global {
    var data: {
        bearer: any;
        bearerConfig: any;
        guild: Guild?;
        factions: any;
        teams: any;
        rolesList: List<Role>;
        rolesCreatedIds: any;
        factionsCategoryIds: any;
    };
    var db: any;
}

export {};
