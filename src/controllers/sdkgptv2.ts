// src/controllers/sdkgpt.ts

import OpenAI from "openai";

export class SdkGPT {
    private openai: OpenAI;

    constructor(apiKey: string) {
        this.openai = new OpenAI({apiKey: apiKey});
    }

    async message(promptx: string): Promise<string> {
        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    //{ role: "developer", content: "You are a helpful assistant." },
                    {
                        role: "user",
                        content: promptx,
                    },
                ],
            });
            return completion.choices[0].message['content'] || "No se recibió respuesta.";
        } catch (error: any) {
            console.error("Error en OpenAI:", error);
            return "Hubo un error al procesar tu solicitud con GPT.";
        }
    }
    
}
