## Production Site
[https://engageai.world](https://engageai.world)

## ABOUT DEMO
In this repo, we provide a hackathon demo Telegram bot, deployed with BotFather configurations as a template.  
This bot has the ability to:

- ✅ Listen to all messages in the group where it is added.
- ✅ BOT configuration commands, both public and private:
  - **[Priv]** `/admin` (checks if your user is classified as admin by the bot)
  - **[Priv]** `/getchatid` (retrieves the chat ID)
  - **[Priv]** `/me` (retrieves your info: TelegramUserID, username)
  - **[Priv]** `/lookwallet` (checks if you have a wallet synced with the bot)
  - **[PUB]** `hello` (the bot responds with a message)
  - **[Priv][Interactive]** `/addwallet $SOLANA_WALLET_ADDRESS`  
    (write the command, followed by a space and your wallet address to associate it with the bot)
  - **[Priv][Interactive]** `/deletewallet`  
    (deletes the wallet associated with your user ID)
- ✅ **[DYNAMIC_DB]** Generates a database and structures the data of messages listened to.
- ✅ This `dynamic_db` is used to work with the GPT-4 model for interaction.
- ✅ **[INHOUSE_TEMPLATES]** Selected in-house templates are used to interact with GPT, classifying the value of chats based on `dynamic_db`.
- ✅ After using some templates, insights about the chat are determined.
- ✅ **[SOLANA_KP]** The bot is synced with a Solana Keypair on Devnet, serving as a Reward Vault.
- ✅ After determining insights, the bot pays a percentage of the vault as a reward to the most valued user.
- ✅ **[SIGNATURE_TRANSFER_DEVNET]** The bot uses a transfer transaction and provides a signature.

## Project Deck:
[View on Canva](https://www.canva.com/design/DAGaKJqCJJk/pZmRKGOaABzIY5cojWT2Lg/edit?utm_content=DAGaKJqCJJk&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)

## Github Repo:
[https://github.com/guzvo92/engageaijs.git](https://github.com/guzvo92/engageaijs.git)

## Telegram Bot 
[@Hackathon_solai_bot](https://t.me/Hackathon_solai_bot)

## Twitter
[https://x.com/engageai_ai](https://x.com/engageai_ai)

## Some points that we are working on...

- Fixing issues in `dynamic_db` to improve maintainability and scalability across groups.
- Sandboxing other storage formats to manipulate data.
- Exploring the Solana Agent Kit for additional integrations.
- Creating a demo that syncs with Metaverse Decentraland Parcel events listeners.
- Developing a demo that scrapes Solana signatures related to a token to expose insights and metrics in the agent.
