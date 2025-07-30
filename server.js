// Loading environment variables
import dotenv from "dotenv";
dotenv.config();

// Configuring Gemini
import { GoogleGenAI } from "@google/genai";

// Configuring Discord
import { Client, GatewayIntentBits } from 'discord.js';

// Environment variable validation
const requiredEnvVars = ['DISCORD_TOKEN', 'GEMINI_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars.join(', '));
    process.exit(1);
}

// Initialize Google GenAI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = "gemma-3-27b-it";

// Initialize Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Handle client errors
client.on('error', (error) => {
    console.error('Discord client error:', error);});

// Handle process events
process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    process.exit(1);
});

// Log when the bot is ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Message handling
client.on('messageCreate', async (message) => {
    if (!message?.author.bot && message.content) {
        try {
            const response = await ai.models.generateContent({
                model: model,
                contents: `Keep the response for this message less than 2000 characters: ${message.content}`,
            });

            await message.channel.send(response.text);
            console.log('Response sent successfully');
        } catch (error) {
            console.error('Error generating response from Gemini AI:', error);
            try {
                await message.channel.send('Sorry, I encountered an error while processing your request.');
            } catch (sendError) {
                console.error('Failed to send error message:', sendError);
            }
        }
    }
});

// Log in to Discord
client.login(process.env.DISCORD_TOKEN)
    .catch(error => {
        console.error('Failed to log in to Discord:', error);
        process.exit(1);
    });