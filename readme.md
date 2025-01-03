# Production Site
[https://engageai.world](https://engageai.world)

---

## ⚠️ **WE HAVE NOT DEPLOYED A SPL TOKEN - Beware of Scammers!**

---

## About the Project

We started this project with the idea of creating a social framework using Telegram bots as the user interface. By leveraging Telegram's data storage capabilities, we aim to enable an intelligent agent to interact with users, learn from them, and provide value to the community. Our motivation also extends to exploring other data hubs, such as social media data, metaverse events triggers at decentraland parcels and other mechanics around the telegram data with the vision of deploying agents and tools across Telegram and the metaverse.

---

## About the Demo

This repository provides a hackathon demo Telegram bot, configured using BotFather as a template. The bot includes the following features:

### Core Capabilities

- ✅ Listens to all messages in the group where it is added.
- ✅ Supports bot configuration commands, both public and private:
  - **[Priv]** `/admin` - Verifies if the user is classified as an admin by the bot.
  - **[Priv]** `/getchatid` - Retrieves the chat ID.
  - **[Priv]** `/me` - Retrieves the user's information: Telegram User ID, username.
  - **[Priv]** `/lookwallet` - Checks if the user has a wallet synced with the bot.
  - **[PUB]** `hello` - Responds with a message.
  - **[Priv][Interactive]** `/addwallet $SOLANA_WALLET_ADDRESS`  - Associates a wallet address with the user by entering the command followed by a space and the address.
  - **[Priv][Interactive]** `/deletewallet` - Deletes the wallet associated with the user ID.
- ✅ **[DYNAMIC_DB]** Automatically generates a database and structures the data of listened messages.
- ✅ Uses the `dynamic_db` to work with the GPT-4 model for interactions.
- ✅ **[INHOUSE_TEMPLATES]** Interacts with GPT using selected in-house templates, classifying the value of chats based on `dynamic_db`.
- ✅ Provides chat insights using the templates.
- ✅ **[SOLANA_KP]** Syncs with a Solana Keypair on Devnet, serving as a Reward Vault.
- ✅ Rewards the most valued user with a percentage of the vault after generating insights.
- ✅ **[SIGNATURE_TRANSFER_DEVNET]** Executes transfer transactions and provides signatures.

---

## Project Deck
[View on Canva](https://www.canva.com/design/DAGaKJqCJJk/pZmRKGOaABzIY5cojWT2Lg/edit?utm_content=DAGaKJqCJJk&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)

## GitHub Repository
[https://github.com/guzvo92/engageaijs.git](https://github.com/guzvo92/engageaijs.git)

## Telegram Bot
[@Hackathon_solai_bot](https://t.me/Hackathon_solai_bot)

## Twitter
[https://x.com/engageai_ai](https://x.com/engageai_ai)

---

## Points We Are Currently Working On

- Fixing issues in `dynamic_db` to improve maintainability and scalability across groups.
- Exploring alternative storage formats to manipulate data effectively.
- Generating new values for `inhouse_templates` to enhance reward determination criteria.
- Experimenting with new reward mechanics to engage users (e.g., group bot additions).
- Investigating the Solana Agent Kit for further integrations.
- Developing user interaction criteria to enable human-like responses instead of standard bot commands.

---

## Key Proof of Concept Objectives

- Implementing the concept of saving data in a SOLANA PROGRAM using the Anchor framework.
- Creating a demo that syncs with Metaverse Decentraland events on parcels to explore alternative reward mechanics.
- Developing a demo that scrapes Solana signatures related to a token to expose insights and metrics via the agent.
- Adding commands to provide wallet insights related to specific tokens (e.g., group bot additions).

---

## Additional Project Goals

- Finalizing and deploying production and development sites for the project.
- Creating a structured roadmap for long-term development.
- Enhancing social media presence and organizing community spaces.
