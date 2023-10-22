const multer = require("multer");
const storage = multer.diskStorage({   
    destination: function(req, file, cb) { 
       cb(null, './views/uploads');    
    }, 
    filename: function (req, file, cb) { 
       cb(null , file.originalname);   
    }
});
const upload = multer({ storage: storage });
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bp = require('body-parser');
const Song = require("./model/songSchema");
const fs = require('fs');
const { Midi } = require('@tonejs/midi');
const cors = require('cors');

const PORT = 4787;
require("dotenv").config();
const db = require('./config/db.config');

mongoose.connect(db.url, {
    useNewUrlParser: true, useUnifiedTopology: true
});

app.use(bp.urlencoded({ extended: false, limit: '5000mb', parameterLimit: 1000000}));
app.use(bp.json({ limit: '5000mb' }));
app.use(cors());
app.set('view engine', 'ejs');
app.use('/', express.static('views'))


app.get('/', async (req, res) => {
    const songList = await Song.find();
    res.render('index', {songList: songList});
});

app.get("/api/getFiles", async (req, res) => {
    try {
      const songs = await Song.find();
      res.status(200).json({
        status: "success",
        songs,
      });
    } catch (error) {
      res.json({
        status: "Fail",
        error,
      });
    }
  });

app.post("/api/uploadFile", upload.single("myFile"), async (req, res) => {
    fs.renameSync(`./views/uploads/${req.file.filename}`, `./views/uploads/${req.file.originalname}`);
    try {
        const newFile = await Song.create({
          name: req.body.songName,
          fileName: req.file.originalname,
        });
        res.status(200).send('OK!');
      } catch (error) {
        res.json({
          error,
        });
      }
});

app.put("/api/updateLyrics", async (req, res) => {
    let song = await Song.findById(req.body.songId);
    song.lyrics = req.body.lyrics;
    await Song.replaceOne({ _id: req.body.songId }, song);

    res.send(song);
});

app.get('/api/getLyrics/:songId', async (req, res) => {
    let song = await Song.findById(req.body.songId);
    if(!song) return res.status(404);
    res.send(song.lyrics);
})

app.get('/api/midiFile/:songId', async (req, res) => {
    let song = await Song.findById(req.params.songId);

    if(!song) return res.status(404);

    let midi = new Midi();
    const track = midi.addTrack();

    for(i = 0; i < song.lyrics.length; i++) {
        const lineObj = song.lyrics[i];
        track.addCC({
            number: 50,
            time: lineObj.timing / 1000,
            value: (i + 1) / 127
        });
    
        lineObj.line.forEach(word => {
            track.addNote({
                midi: 0,
                time: word.timing / 1000,
                duration: 1/16
            })
        })
    }

    fs.writeFileSync(`${__dirname}/midi/${song.name}.mid`, new Buffer.from(midi.toArray()));

    res.sendFile(`${__dirname}/midi/${song.name}.mid`, (err) => {
      if(err) res.status(500);
    })
})

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}...`);
});