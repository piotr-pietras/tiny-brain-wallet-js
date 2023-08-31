# tiny-brain-wallet-js

Nothing fancy just a very tiny brain wallet built upon **Block Daemon API**.
Type any sentences or phrases **only you know** to retrieve your keys and make some transactions. _(do not use on mainnet yet)_

https://github.com/piotr-pietras/tiny-brain-wallet-js/assets/80528901/70293f5c-1b67-4bce-90a9-b9109dc31c5d

#### Start

Retrieve your own api key from [Block Daemon](https://www.blockdaemon.com/)
and paste it into `src/api/api.const.ts`

then

```
npm i
npm run build
npm run start
```

#### Current features

- btc transaction (only p2pkh at this moment)
- eth transaction
- erc20 transfer method (more methods are coming)

#### Vision

The app aims to be **easy to audit** and _(I hope someday)_ **free of any dependency**.

#### Current dependency list

- @noble/hashes: 1.3.1
- bitcoinjs-lib: 5.2.0
- ethers: 6.6.4
- inquirer: 9.2.7

```
    /\_______/\
   /   o   o   \
  (  ==  ^  ==  )
   )           (
  (             )
 (  (  )   (  )  )
(__(__)_____(__)__)
```
