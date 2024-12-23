// src/sdk/sdktonbot.ts

import { Telegraf, Context } from 'telegraf';
import { SdkGPT } from '../controllers/sdkgpt'; // Asegúrate de que la clase SdkGPT esté correctamente exportada

export class SdkTonBot {
    private bot: Telegraf<Context>;
    private gptKey: string;
    private adminId: number;
    private gptController: SdkGPT;

    constructor(botToken: string, gptKey: string, adminId: number) {
        this.bot = new Telegraf(botToken);
        this.gptKey = gptKey;
        this.adminId = adminId;
        this.gptController = new SdkGPT(this.gptKey);

        this.setupHandlers();
        this.setupErrorHandler(); // Agrega un manejador de errores global
    }

    private setupHandlers() {
        // Comando /start
        this.bot.start(async (ctx: Context) => {
            await ctx.reply("¡Hola! Soy un bot usando Telegraf (Node.js).");
        });

        // Comando /admin
        this.bot.command('admin', async (ctx: Context) => {
            const userId = ctx.from?.id;

            // Verifica que ctx.chat esté definido y sea privado
            if (ctx.chat && ctx.chat.type === 'private') {
                if (userId === this.adminId) {
                    await ctx.reply(`Entraste al comando admin con el id ${userId}`);
                } else {
                    await ctx.reply("No eres el admin.");
                }
            } else {
                await ctx.reply("Este comando solo funciona en chats privados.");
            }
        });

        // Comando /getchatid
        this.bot.command('getchatid', async (ctx: Context) => {
            // Verifica que ctx.chat esté definido y sea privado
            if (ctx.chat && ctx.chat.type === 'private') {
                const chatId = ctx.chat.id;
                await ctx.reply(`El ID de este chat es: ${chatId}`);
            } else {
                await ctx.reply("Este comando solo funciona en chats privados.");
            }
        });

        // Comando /me
        this.bot.command('me', async (ctx: Context) => {
            // Verifica que ctx.chat esté definido y sea privado
            if (ctx.chat && ctx.chat.type === 'private') {
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
        this.bot.hears(/hola/i, async (ctx: Context) => {
            await ctx.reply("hellofrend");
        });

        // Handler para mensajes que contienen "gpt"
        this.bot.hears(/gpt/i, async (ctx: Context) => {
            // Verifica que ctx.message exista y tenga la propiedad 'text'
            if (!ctx.message || !('text' in ctx.message)) {
                await ctx.reply("Este comando solo funciona con mensajes de texto.");
                return;
            }

            const messageText = ctx.message.text || "";
            const prompt = messageText.replace(/gpt/i, '').trim();
            if (prompt.length === 0) {
                await ctx.reply("Por favor, proporciona un prompt después de 'gpt'.");
                return;
            }

            await ctx.reply("Procesando...");
            try {
                const response = await this.gptController.createNewPrompt(prompt);
                await ctx.reply(response);
            } catch (error) {
                console.error("Error al procesar GPT:", error);
                await ctx.reply("Hubo un error al procesar tu solicitud.");
            }
        });
    }

    private setupErrorHandler() {
        this.bot.catch((err, ctx) => {
            console.error(`Ocurrió un error para ${ctx.updateType}`, err);
            if (ctx && ctx.reply) {
                ctx.reply("Hubo un error interno. Por favor, intenta nuevamente más tarde.");
            }
        });
    }

    public run() {
        this.bot.launch().then(() => {
            console.log("Bot iniciado correctamente.");
        });

        // Maneja cierres del proceso para apagar el bot limpiamente
        process.once('SIGINT', () => this.bot.stop('SIGINT'));
        process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    }
}
