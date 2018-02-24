# CryptoApp

## Getting Started

Clone the repo and install dependencies
```
$ git clone https://github.com/cryptoapp-cs428/cryptoapp-cs428.git
$ cd cryptoapp-cs428
$ npm install
```
Then add the `.env` file (directions shown below)

## Start the backend node.js server
`$ npm run server`

## Start the frontend React client (you will need to run the server too!)
`$ npm run client`

## Deploy frontend changes
`$ npm run build`
Then make a pull request

## Set up environment variables

Create a file called `.env` and place it in the root directory at `cryptoapp-cs428/.env`
```
# React uses this to build prod files
PUBLIC_URL='https://cryptoapp-cs428.herokuapp.com'

# Prod DB
DB_URL='mysql://[user]:[password]@[connection_str]:3306/[db_name]'

# Local DB
# DB_URL='mysql://root:[password]@127.0.0.1:3306/[db_name]'

# Token
TOKEN_SECRET='[token_secret]'

# Email Verification
EMAIL_USER='email.auth.helper@gmail.com'
EMAIL_PASS='[email_password]'

# Endpoint URL dev
ENDPOINT='http://localhost:5000'

# Endpoint URL prod
# ENDPOINT='https://cryptoapp.ml'

# React uses this to build prod files
PUBLIC_URL='https://cryptoapp-cs428.herokuapp.com'

```

## Deploying a contract instance

Use this command to deploy an instance of the solidity contract:
```sh
npm run solidity:deploy
```

To deploy from a custom account, set a `DEPLOY_MNEMONIC` environment variable
with the mnemonic of the account to use. You can also set a `DEPLOY_ACCT_INDEX`
environment variable to specify which account to use. (The default index is 0,
and the default account is `0x41387f90C3BE2C13E6775CbF2AD1A3A5BbE9B2DE`)
