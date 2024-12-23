import OpenAI from "openai";

import dotenv from 'dotenv';
dotenv.config()

//console.log(process.env.GPTKEY);
const openai = new OpenAI({apiKey: process.env.GPTKEY});

async function main(){
const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
        //{ role: "developer", content: "You are a helpful assistant." },
        {
            role: "user",
            content: "Dime quien es Rambo",
        },
    ],
});

console.log(completion.choices[0].message['content']);

}


main();