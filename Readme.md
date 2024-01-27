# Follow the commands for installing the app on your local machine

ensure you have node and npm installed on your local machine

clone the repo in your system
COMMAND: git clone : [https://github.com/YBhatta2058/greatBackend]

cd greatBackend

rename .env.sample to .env
add your mongo db uri from any cloud mongo db service provider

openssl rand -hex 32 ( use git bash )
paste this command to get a key and paste the key in ACCESS_TOKEN_SECRET

again do the same for REFRESH_TOKEN_SECRET but get a new key using the same command

npm i

npm run dev

