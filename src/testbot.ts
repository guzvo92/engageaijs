// src/testbot.ts

import dotenv from 'dotenv';
import { SdkTonBot } from './controllers/sdktonbot';

// Cargar variables de entorno desde el archivo .env
dotenv.config();

async function main() {
    const BOT_TOKEN = process.env.BOTFATHERKEY; // Token del bot proporcionado por BotFather
    const GPT_KEY = process.env.GPTKEY; 
    const adminid = 1678293493

    if (!BOT_TOKEN) {throw new Error("BOT_TOKEN undefined");}
    if (!GPT_KEY) {throw new Error("GPTKEY undefined");}

    const bot = new SdkTonBot(BOT_TOKEN, GPT_KEY,adminid);
    bot.run();
}

// Ejecuta la función principal
main().catch((error) => {
    console.error("Error al iniciar el bot:", error);
});
