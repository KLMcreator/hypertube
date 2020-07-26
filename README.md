# Hypertube
A torrent search engine and streaming website that also stores movies on the server to avoid useless re-downloads.
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
# Sources
* Torrent9
* YTS
* 1337x
# Features
* Search torrents in no time because it's already scrapped
* Neat display
* Either watch it on streaming on the website or wait for it to finish downloading to get it on your computer
* No useless re-downloads
* Random torrents on home page if you don't know what to watch
* Multiple search filters
* Rating system (thumbs up, thumbs down)
* View history
* Comment while watching the movie
* Multiple resolutions from different sources
* French and English language
* 35+ subtitle languages
* See other users history, likes and comments on their profile
* Download manager to keep track of the downloading movies
* Sort torrents by rating, name, production year...
* Auto delete unwatched movies after 30 days
AND MORE!
# Contributing
I will update this project with some new features if I can, pull requests are welcome.
# Authors
* Clement [KLMcreator](https://github.com/KLMcreator) VANNICATTE<br />
* Elise [Eozimek](https://github.com/Eozimek) OZIMEK<br />
* Marie [MarieNawaki](https://github.com/MarieNawaki) Many
