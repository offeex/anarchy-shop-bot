# anarchy-shop-bot
Typescript discord bot targeted for 2b2t (anarchy-like) servers shops.

## Lore
We spent week and more on writing that shit with thought in mind we're going to make able to work alongside with payment system, so for now, only manual payment check is supported.

I decided to leave anarchy shop business, hence why this bot is now public.

Whats so special about this bot:
- First off, it is **NOT** shopping cart bot. The design is created by **me** from scratch.
- Second, fully-typed. We use **[typegoose](https://github.com/typegoose/typegoose)**, as you may observe [there](https://github.com/offeex/anarchy-shop-bot/tree/main/src/models)  

## Specifics
> what is this third-worlders cyrillic language is present in the bot?

1. For now, the default language there is russian, so just keep in mind that the bot was designed for concrete goal.

> what database we work with?

2. as you may see in .env.tmp file, there's DATABASE_URL field, a db it had been originally designed for is **mongodb**
