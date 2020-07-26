# Hypertube
A torrent search engine and streaming website that also stores the movies on the server to avoid useless re-downloads.
# Dependencies
You need to have [PostgreSQL](https://wiki.postgresql.org/wiki/Homebrew) and [NodeJS](https://nodejs.org/en/) installed, everything else is included in the modules.
# Installation
For now, just head to the root folder (hypertube) and client folder (client) and install modules in both of them.
```bash
./hypertube: npm install
./hypertube/client: npm install
```
Torrents are pre-scrapped to avoid multiple requests so run the setup script to populate your database.
```bash
./hypertube: node setup.js
```
If you want to scrape new torrents or just update them delete the `finalTorrents.json` file inside `./hypertube/scripts` and run
```bash
./hypertube: node setup.js
```
# Usage
Start both servers (Node.js and React) and you are good to go. (In case you didn't know, you will need two shell windows to do so)
```bash
./hypertube: npm start
./hypertube/client: npm start
```
# Contributing
I will update this project with some new features if I can, pull requests are welcome.
# Authors
Clement [KLMcreator](https://github.com/KLMcreator) VANNICATTE<br />
Elise [Eozimek](https://github.com/Eozimek) OZIMEK<br />
Marie [MarieNawaki](https://github.com/MarieNawaki) Many
