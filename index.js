require('dotenv').config();

// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS] });

client.on('guildMemberAdd', member => {
	// TODO: check if the user is in the integration DB and if yes add correct roles, if no send a message to ask him to add his role on the website
	console.log(`New User "${member.user.username}" has joined "${member.guild.name}"`);
	member.guild.channels.cache.find(c => c.name === 'welcome').send(`"${member.user.username}" has joined this server`);
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
	recheckRolesAndNames();
});

async function recheckRolesAndNames() {
	const guild = client.guilds.cache.get(process.env.GUILD_ID);
	const members = await guild.members.fetch();
	members.forEach(mb => {
		console.log(mb.guild.name);
	});
}


// Login to Discord with your client's token
client.login(process.env.BOT_TOKEN);
