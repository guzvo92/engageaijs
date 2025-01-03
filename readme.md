## Production Site
https://engageai.world

## ABOUT
In this repo we provide a hackathon demo telegram bot, deployed at botfather configurations template.
This has the ability to:
- ✅ Listen all messages of group in what is added
- ✅ BOT config Commands public & private:
    -[Priv] /admin [look if ur user is classify by admin in the bot]
    -[Priv] /getchaitd [get chat id]
    -[Priv] /me [get info of me (telegramUserID, username)]
    -[Priv] /lookwallet [loot if has wallet sync with the bot]
    -[PUB] hello [Bot responds with a msg]
    -[Priv][Interactive] /addwallet $SOLANA_WALLET_ADDRESS (write command space an wallet to associate ur wallet with the bot)
    -[Priv][Interactive] /deletewallet (deletes the wallet asssociated to ur userID)
- ✅ [DYNAMYC_DB] Generate a DB and struct the data of MSGs listened
- ✅ These dynamic_db is used to work with gpt4 model to interact
- ✅ [INHOUSE_TEMPLATES] We selected some inhouse_templates to interact with gpt to classify value at chat provided by dynamic_db
- ✅ After some templates we determine some insights about chat
- ✅ [SOLANA_KP] The Bot has been sync with one Solana-KP at devnet to has some Reward Vault
- ✅ After determination of Insights Value the bot pay some percent of vault to reward the most valued User Determination
- ✅ [SIGNATURE_TRANSFER_DEVNET] The bot uses a transfer transaction and provides a signature.


## Project Deck:
https://www.canva.com/design/DAGaKJqCJJk/pZmRKGOaABzIY5cojWT2Lg/edit?utm_content=DAGaKJqCJJk&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton

## Github repo:
https://github.com/guzvo92/engageaijs.git


## Telegram Bot 
@Hackathon_solai_bot
https://t.me/Hackathon_solai_bot

## Twitter
https://x.com/engageai_ai


## Some points that we are working ...

- Fixing things at Dynamic_db to perform mantinability and scalability through groups
- Sandboxing other stored forms of manipulate the data
- Exploring the solana agent kit for other integrations
- Creating a demo sync with Metaverse Decentraland Parcel events listener
- Creating a demo that scrape solana signatures related a token for expose insights and metrics at the Agent 



