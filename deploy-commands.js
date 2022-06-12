const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();
const clientId = process.env.DISCORD_CLIENTID
const guildId = process.env.DISCORD_GUILDID
const token = process.env.DISCORD_TOKEN
const commands = [
	new SlashCommandBuilder().setName('stock').setDescription('Get Stock information'),
	new SlashCommandBuilder().setName('orderinfo').setDescription('Get gmails from a particular order').addStringOption(option => 
		option.setName('input')
		.setDescription('Order number to lookup')
		.setRequired(true))
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);