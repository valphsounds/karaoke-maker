# karaokeMaker
![NJXVsa9l2G](https://github.com/valphsounds/karaoke-maker/assets/103525588/e736de9e-91f3-4c07-90a9-569e89c0ecc3)
## Local:
### Prep:
- Install node and npm -> https://nodejs.org/en
- Install nodemon -> terminal `npm i -g nodemon`
- Install mongoDB -> https://www.mongodb.com/docs/manual/installation/

### Setup:
1. Clone directory where you want it.
2. Navigate into the app-folder in the karaoke-maker directory and make a .env-file. You can use the example in the same directory as inspiration.
3. Open terminal in that directory and run `npm install`
4. Then run `npx tailwindcss -i ./src/input.css -o ./views/css/tailwind.css`
5. Create folder named uploads in views directory (may not be needed in future update).
6. Finally run `nodemon index.js`

## Docker:
### Prep:
- Install docker and docker-compose -> https://docs.docker.com/get-docker/

### Setup:
1. Clone directory where you want it.
2. Navigate into the karaoke-maker directory and make a .env-file. You can use the example in the same directory as inspiration but you may want to change ports according to what is available on your machine.
3. Open terminal and run `docker-compose up -d`

## Using the app:
https://github.com/valphsounds/karaoke-maker/assets/103525588/a9fbf3a1-2719-4acf-a121-c46782a8f79e
