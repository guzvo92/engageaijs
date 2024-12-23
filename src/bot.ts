// src/bot.ts

import { Telegraf, Context } from 'telegraf';
import dotenv from 'dotenv';
import { sdkGPT } from './controllers/sdkgpt';
import { solanaSDK } from './sdk/solanaSDK';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN as string;
const GPT_KEY = process.env.GPT_KEY as string;
const ADMIN_ID = parseInt(process.env.ADMIN_ID as string, 10);
const SOLANA_SECRET_KEY = process.env.SOLANA_SECRET_KEY as string;

if (!BOT_TOKEN || !GPT_KEY || !ADMIN_ID) {
    throw new Error("Faltan variables de entorno necesarias (BOT_TOKEN, GPT_KEY, ADMIN_ID)");
}

const bot = new Telegraf(BOT_TOKEN);

// Inicializa tus SDKs
const gptController = new sdkGPT(GPT_KEY);
const solanaController = SOLANA_SECRET_KEY ? new solanaSDK(SOLANA_SECRET_KEY) : null;

// Comando /start
bot.start(async (ctx: Context) => {
    await ctx.reply("¡Hola! Soy un bot usando Telegraf (Node.js).");
});

// Comando /admin
bot.command('admin', async (ctx: Context) => {
    const userId = ctx.from?.id;
    if (ctx.chat.type === 'private') {
        if (userId === ADMIN_ID) {
            await ctx.reply(`Entraste al comando admin con el id ${userId}`);
        } else {
            await ctx.reply("No eres el admin.");
        }
    } else {
        await ctx.reply("Este comando solo funciona en chats privados.");
    }
});

// Comando /getchatid
bot.command('getchatid', async (ctx: Context) => {
    if (ctx.chat.type === 'private') {
        const chatId = ctx.chat.id;
        await ctx.reply(`El ID de este chat es: ${chatId}`);
    } else {
        await ctx.reply("Este comando solo funciona en chats privados.");
    }
});

// Comando /me
bot.command('me', async (ctx: Context) => {
    if (ctx.chat.type === 'private') {
        const user = ctx.from;
        const userId = user?.id;
        const username = user?.username || "No definido";
        const phone = "No disponible"; // Telegram API no proporciona el número de teléfono
        await ctx.reply(
            `Tu información es:\nID: ${userId}\nNombre de usuario: ${username}\nTeléfono: ${phone}`
        );
    } else {
        await ctx.reply("Este comando solo funciona en chats privados.");
    }
});

// Handler para mensajes que contienen "hola"
bot.hears(/hola/i, async (ctx: Context) => {
    await ctx.reply("hellofrend");
});

// Handler para mensajes que contienen "gpt"
bot.hears(/gpt/i, async (ctx: Context) => {
    const messageText = ctx.message?.text || "";
    const prompt = messageText.replace(/gpt/i, '').trim();
    if (prompt.length === 0) {
        await ctx.reply("Por favor, proporciona un prompt después de 'gpt'.");
        return;
    }

    await ctx.reply("Procesando...");
    try {
        const response = await gptController.createNewPrompt(prompt);
        await ctx.reply(response);
    } catch (error) {
        console.error("Error al procesar GPT:", error);
        await ctx.reply("Hubo un error al procesar tu solicitud.");
    }
});

// Comando /balance
if (solanaController) {
    bot.command('balance', async (ctx: Context) => {
        if (ctx.chat.type === 'private') {
            try {
                const balance = await solanaController.getBalance();
                await ctx.reply(`Tu saldo de SOL es: ${balance} SOL`);
            } catch (error) {
                console.error("Error al obtener el balance de Solana:", error);
                await ctx.reply("Hubo un error al obtener tu saldo de SOL.");
            }
        } else {
            await ctx.reply("Este comando solo funciona en chats privados.");
        }
    });

    // Comando /transfer
    bot.command('transfer', async (ctx: Context) => {
        if (ctx.chat.type === 'private') {
            const args = ctx.message?.text.split(' ').slice(1);
            if (args?.length !== 2) {
                await ctx.reply("Uso correcto: /transfer <recipient_wallet> <amount_sol>");
                return;
            }

            const [recipient, amountStr] = args;
            const amount = parseFloat(amountStr);

            if (isNaN(amount) || amount <= 0) {
                await ctx.reply("Por favor, proporciona una cantidad válida de SOL para transferir.");
                return;
            }

            try {
                const signature = await solanaController.transferSOL(recipient, amount);
                await ctx.reply(`Transferencia realizada. Firma de la transacción: ${signature}`);
            } catch (error) {
                console.error("Error al transferir SOL:", error);
                await ctx.reply("Hubo un error al realizar la transferencia de SOL.");
            }
        } else {
            await ctx.reply("Este comando solo funciona en chats privados.");
        }
    });
}

// Inicia el bot
bot.launch().then(() => {
    console.log("Bot iniciado correctamente.");
});

// Maneja cierres del proceso para apagar el bot limpiamente
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
