npm install telegraf dotenv typescript
npx tsc --init   //para que no se fastidien los tipos
npm install @solana/web3.js
npm install bs58
npm install --save-dev typescript ts-node @types/node @types/telegraf //para que acepte los require
npm install openai
npm install --save-dev ts-node



docker build -t engageaibot .
docker build --no-cache -t engageaibot .
docker run -d -p 4100:3800 --name=engageaibot -v $PWD:/app engageaibot

docker run -it --rm engageai ls /app/src


la version actual del dockerfile con alpipne:
npm --version && node --version
10.9.2
v23.5.0
