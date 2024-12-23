// src/index.ts

import dotenv from 'dotenv';
import { SdkGPT } from './controllers/sdkgpt';

// Cargar variables de entorno desde el archivo .env
dotenv.config();

async function main() {
    const GPT_KEY = process.env.GPTKEY;

    if (!GPT_KEY) {
        throw new Error("GPTKEY no está definido en las variables de entorno.");
    }

    const gpt = new SdkGPT(GPT_KEY);

    // Declara el tipo explícito para evitar conflictos con TypeScript
    const message: { role: "system" | "user" | "assistant"; content: string }[] = [
        { 
            role: "user", 
            content: "Dime quien es Rambo" 
        }
    ];

    try {
        // Genera la respuesta utilizando el prompt
        const response = await gpt.message(message);
        console.log("Respuesta de GPT:", response);
    } catch (error) {
        console.error("Error al generar el prompt:", error);
    }
}

// Ejecuta la función principal
main();
