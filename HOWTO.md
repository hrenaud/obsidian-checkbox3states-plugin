# How to dev

## 1. Create `.env` file

Do `cp .env.template .env` and fill vars.

## 2. Enabled build

**WARNING**
if your are into your icloud folder, to protect you to iCloud to sync `node_modules` folder, you can

-   do `mv node_modules node_modules.nosync && ln -s node_modules.nosync node_modules` and add `node_modules.nosync` to `.gitignore`.
-   use this pachage [tsdexter/icloud-nosync-node](https://github.com/tsdexter/icloud-nosync-node) with `npm install -g icloud-nosync-node` than `nosync-node` or `nsn`.

And do `npm run dev` to unabled autobuid.

## 3. When ready to test

-   Push you files to your Obsidian vault plugin folder with `npm run copybeta` (don't forget step 1).
-   Enabled your plugin in Osbidian community plugins.
-   Test...

## 4. When test over, clean

Clean your Obsidian vault plugin folder with `npm run rmbeta`.

## 5. Update version

-   Change version in `package.json`
-   Do `npm run version`.

## 6. Commit your changes

...As usual...

## 7. Create release and tag

In GitHub, create a release and dont forget to add `main.js` `manifest.json` and optionnaly `styles.css`
