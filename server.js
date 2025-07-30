// Loading environment variables
import dotenv from "dotenv"
dotenv.config()

// // JSDOM:
// import { JSDOM } from "jsdom"
// const dom = new JSDOM()


// Configuring Gemini
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
// const model = "gemini-2.0-flash"
const model = "gemma-3-27b-it"

// Configuring Discord
import {
    Client,
    GatewayIntentBits,
} from 'discord.js';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
})

// Logging in to the app
client.login(process.env.DISCORD_TOKEN)

// Checking messages
client.on('messageCreate', async (message) => {
    // console.log(message.content)

    if (!message?.author.bot && message.content) {
        // if (!message?.author.bot && message.author.id !== client.user.id) {
        try {

            const response = await ai.models.generateContent({
                model: model,
                contents: `Keep the response for this message less than 2000 
        characters: ${message.content}`,
            });

            // let amsg = "This is a message."
            message.channel.send(response.text);

            console.log(response.text)
        } catch (error) {
            console.error("Error generating response from Gemini AI:", error);
            message.channel.send("Sorry, I couldn't process that right now.");
        }
    }
})