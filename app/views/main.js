// Global elements
const songPlayer = document.getElementById('songPlayer');
const lyricPos = document.getElementById('lyricPos');
const songRange = document.getElementById('songRange');
const line = document.getElementById('line');
const nxtLine = document.getElementById('nxtLine');
const textarea = document.querySelector(".resize-ta");
const lyricBox = document.getElementById('lyricBox');
const songList = document.getElementById('songList');
const themeSel = document.getElementById('themeSel');

// Global variables
let menuOpen = false;

let songLyrics = [];
let timedLine = [];

let lineCnt = 0;
let wordCnt = 0;
let timer;
let position = 0;

let words;

let isPlaying = false;
let isRecording = false;

// On Load
window.addEventListener('load', () => {
    let theme = localStorage.getItem('theme');
    if (theme) {
        themeSel.value = theme;
        changeTheme(theme);
    }
})

// Choose song
songList.addEventListener('change', async () => {
    songPlayer.src = `./uploads/${songList.value}`;
    const songName = songList.value.replace('.mp3', '');
    lyricPos.innerText = "";
    fetchGetLyrics(songName);
    songList.blur();
})

// Add song/lyrics menu
const menuBtns = {
    open: document.getElementById('songOpenBtn'),
    form: document.getElementById("fileUploadForm"),
    saveLyrics: document.getElementById('saveLyricsBtn'),
    editLyrics: document.getElementById('editLyricsBtn')
}
menuBtns.open.addEventListener('click', (e) => {
    e.target.parentNode.classList.toggle('-translate-x-full');
    e.target.classList.toggle('rounded-tr-none');
    e.target.classList.toggle('translate-x-20');

    if(menuOpen) {
        e.target.innerHTML = 'Menu <i class="fa-solid fa-angle-right"></i>';
        menuOpen = false;
    } else {
        e.target.innerHTML = '<i class="fa-solid fa-angle-left"></i> Menu';
        menuOpen = true;
    }
})

menuBtns.form.addEventListener('submit', (e) => {
    e.preventDefault();
    let formData = formDataFromForm(e.target);
    postData(formData, '/api/uploadFile');
})

textarea.addEventListener("keyup", () => {
    textarea.style.height = calcHeight(textarea.value) + "px";
});

menuBtns.saveLyrics.addEventListener('click', () => {
    songLyrics = [];
    const separateLines = lyricBox.value.split(/\r?\n|\r|\n/g).map(line => line.trim()).filter(line => line !== '');
    for(i = 0; i < separateLines.length; i++) {
        let line = separateLines[i].split(' ');
        for( j = 0; j < line.length; j++) {
            line[j] = {
                word: line[j],
                timing: null
            };
        }
        songLyrics.push({
            line: line,
            timing: null
        });
    }
    const name = songList.value.replace('.mp3', '');
    fetchPutLyrics(name, songLyrics);
    lyricBox.value = "";
    textarea.style.height = calcHeight(textarea.value) + "px";
})

menuBtns.editLyrics.addEventListener('click', () => {
    let content = "";
    for( let i = 0; i < songLyrics.length; i++ ) {
        let line = "";
        for( let j = 0; j < songLyrics[i].line.length; j++ ) {
            if(j + 1 < songLyrics[i].line.length) {
                line = line + `${songLyrics[i].line[j].word} `
            } else if ( i + 1 === songLyrics.length ) {
                line = line + `${songLyrics[i].line[j].word}`
            } else {
                line = line + `${songLyrics[i].line[j].word}\n`
            }
        }
        content = content + line;
    }
    lyricBox.value = content;
    textarea.style.height = calcHeight(textarea.value) + "px";
})

// TIMELINE/SONG PLAYER

// songPlayer
songPlayer.addEventListener('playing', () => {
    isPlaying = true;
})

songPlayer.addEventListener('pause', () => {
    isPlaying = false;
    line.innerText = '';
    nxtLine.innerText = '';
})

songPlayer.addEventListener('ended', () => {
    clearInterval(timer);
    if(isRecording) {
        const name = songList.value.replace('.mp3', '');
        fetchPutLyrics(name, songLyrics);
        isRecording = false;
    }
})

songPlayer.onloadedmetadata = () => {
    songRange.max = songPlayer.duration
    songRange.hidden = false;
    document.getElementById('leftBtn').hidden = false;
    document.getElementById('rightBtn').hidden = false;
}

songRange.oninput = () => {
    songPlayer.currentTime = songRange.value
    position = songRange.value * 1000;
    lineCnt = 0;
    wordCnt = 0;
    checkTiming();
}

const nav = {
    left: document.getElementById('leftBtn'),
    right: document.getElementById('rightBtn'),
    newPercent: (int) => {
        if(!lyricPos.style.left) lyricPos.style.left = '0%';
        if(!songRange.style.left) songRange.style.left = '0%';

        let newValue = parseInt(lyricPos.style.left.replace('%', ''))+int;

        if(newValue > 0 || newValue < -900) return;
        lyricPos.style.left = `${newValue}%`;
        songRange.style.left = `${newValue}%`;
    }
}

nav.left.addEventListener('click', () => {
    nav.newPercent(50);
})

nav.right.addEventListener('click', () => {
    nav.newPercent(-50);
})

// Control Buttons
const ctrlBtns = {
    play: document.getElementById('playBtn'),
    rec: document.getElementById('recBtn'),
    stop: document.getElementById('stopBtn'),
    save: document.getElementById('saveBtn'),
    getMidi: document.getElementById('getMidiBtn')
}

ctrlBtns.play.addEventListener('click', () => {
    songPlayer.play();

    clearInterval(timer);

    timer = setInterval(() => {
        position = songPlayer.currentTime * 1000;
        songRange.value = songPlayer.currentTime;
        if(songLyrics.length > 0) {
            checkTiming();
            if(!nxtLine.innerText && songLyrics[0].timing > position) {
                let nxtLineStr = "";
                for(let i = 0; i < songLyrics[0].line.length; i++) {
                    if(i + 1 === songLyrics[0].line.length) {
                        nxtLineStr += songLyrics[0].line[i].word;
                    } else {
                        nxtLineStr += songLyrics[0].line[i].word + ' ';
                    }
                }
                nxtLine.innerText = nxtLineStr
            }
        } 
        const p = Math.floor(songPlayer.currentTime / songPlayer.duration * 100);
        if(p % 10 === 0) {
            const newPercent = p * -10;
            if(newPercent >= -900) {
                songRange.style.left = `${newPercent}%`;
                lyricPos.style.left = `${newPercent}%`;
            }
        }
    },
    25);
})

ctrlBtns.rec.addEventListener('click', () => {
    isRecording = true;
    songPlayer.play();

    clearInterval(timer);

    timer = setInterval(() => {
        position = songPlayer.currentTime * 1000;
        songRange.value = songPlayer.currentTime;

        const p = Math.floor(songPlayer.currentTime / songPlayer.duration * 100);
        if(p % 10 === 0) {
            const newPercent = p * -10;
            if(newPercent >= -900) {
                songRange.style.left = `${newPercent}%`;
                lyricPos.style.left = `${newPercent}%`;
            }
        }
    },
    25);

    placeLyrics();
    ctrlBtns.rec.blur();
})

ctrlBtns.stop.addEventListener('click', () => {
    songPlayer.pause();
    clearInterval(timer);
    if(isRecording) {
        const name = songList.value.replace('.mp3', '');
        fetchPutLyrics(name, songLyrics);
        isRecording = false;
    }
})

ctrlBtns.stop.addEventListener('dblclick', () => {
    wordCnt = 0;
    lineCnt = 0;
    songPlayer.currentTime = 0;
    songRange.value = 0;
    position = 0;
    songRange.style.left = '0%';
    lyricPos.style.left = '0%';
})

ctrlBtns.save.addEventListener('click', () => {
    const name = songList.value.replace('.mp3', '');
    fetchPutLyrics(name, songLyrics);
})

ctrlBtns.getMidi.addEventListener('click', async () => {
    const songName = songList.value.replace('.mp3', '');
    fetchGetMidiFile(songName);
})

// Space listener
window.addEventListener('keydown', (e) => {
    if(e.code === 'Space') {
        if(isRecording) {
            words[wordCnt].classList.add(`bg-${currentTheme}-500`);
            words[wordCnt].classList.add(`text-${currentTheme}-50`);
            setTimedLine();
    
            wordCnt++;
            if(wordCnt === songLyrics[lineCnt].line.length) {
                setTimedLyric();
                lineCnt++;
                line.innerText = '';
                wordCnt = 0;
                placeLyrics();
            }
        } else if(!menuOpen && isPlaying) {
            ctrlBtns.stop.click();
        } else if(!menuOpen) {
            ctrlBtns.play.click();
        }
    }
})

// Theme selector
const themeElements = document.querySelectorAll('[data-theme]');
let currentTheme = 'violet';

themeSel.addEventListener('change', (e) => {
    changeTheme(e.target.value);
    localStorage.setItem('theme', currentTheme);
    makeLineMarkers();
    const markers = document.getElementsByClassName('markers');
    for(i = 0; i < markers.length; i++) {
        dragElement(markers[i]);
    }
})

function changeTheme(theme) {
    themeElements.forEach(elm => {
        let newClassList = [];
        elm.classList.forEach(c => {
            if(c.includes(currentTheme)) {
                let nc = c.replace(currentTheme, theme);
                newClassList.push(nc);
            } else {
                newClassList.push(c);
            }
        })
        elm.className = newClassList.join(' ');
    })
    currentTheme = theme;
}

// Calculates height of lyric textarea content
function calcHeight(value) {
    let numberOfLineBreaks = (value.match(/\n/g) || []).length;
    let newHeight = 20 + numberOfLineBreaks * 20 + 12 + 2;
    return newHeight;
}

// Play functions
function checkTiming() {
    if(songLyrics[0].timing === null) return;
    let nxtLine = lineCnt + 1;

    if(songLyrics[lineCnt].line[songLyrics[lineCnt].line.length - 1].timing + 5000 < position) line.innerText = '';

    if(nxtLine < songLyrics.length && songLyrics[nxtLine].timing <= position) {
        while(nxtLine < songLyrics.length && position > songLyrics[nxtLine].timing) {
            lineCnt++;
            nxtLine = lineCnt + 1;
        }
        line.innerText = '';
        wordCnt = 0;
        placeLyrics();
    }

    if(lineCnt === 0 && songLyrics[lineCnt].timing <= position && line.innerText === '') {
        placeLyrics(); 
    }

    while(wordCnt < songLyrics[lineCnt].line.length && songLyrics[lineCnt].line[wordCnt].timing <= position) {
        words[wordCnt].classList.add(`bg-${currentTheme}-500`);
        words[wordCnt].classList.add(`text-${currentTheme}-50`);
        wordCnt++;
    }
}

function placeLyrics() {
    let length;
    if(songLyrics[lineCnt+1] && songLyrics[lineCnt].line.length - songLyrics[lineCnt+1].line.length < 0) {
        length = songLyrics[lineCnt+1].line.length;
    } else {
        length = songLyrics[lineCnt].line.length;
    }

    let nxtLineStr = "";
    for(i = 0; i < length; i++) {
        //Main Line
        if(i < songLyrics[lineCnt].line.length) {
            let em = document.createElement('em');
            em.classList.add('words');
    
            if(i + 1 === songLyrics[lineCnt].line.length) {
                em.innerText = songLyrics[lineCnt].line[i].word;
            } else {
                em.innerText = songLyrics[lineCnt].line[i].word + ' ';
            }
            line.appendChild(em);
        }

        // Next Line
        if(songLyrics[lineCnt+1] && i < songLyrics[lineCnt+1].line.length) { 
            if(i + 1 === songLyrics[lineCnt+1].line.length) {
                nxtLineStr += songLyrics[lineCnt+1].line[i].word;
            } else {
                nxtLineStr += songLyrics[lineCnt+1].line[i].word + ' ';
            }
        }
    }
    words = document.getElementsByClassName('words');
    nxtLine.innerText = nxtLineStr;
}

// Recording functions
function setTimedLine() {
    songLyrics[lineCnt].line[wordCnt].timing = position - 100;
}

function setTimedLyric() {
    songLyrics[lineCnt].timing = songLyrics[lineCnt].line[0].timing - 200;
}

// Line marker functions
function makeLineMarkers() {
    lyricPos.innerText = "";
    for(i = 0; i < songLyrics.length; i++) {
        for (let j = 0; j < songLyrics[i].line.length; j++) {
            let wordDiv = document.createElement('div');
            wordDiv.classList.add('markers');
            wordDiv.classList.add('wordMarkers');
            wordDiv.style.left = `${msToPercent(songLyrics[i].line[j].timing, songPlayer.duration)}%`;
            if(i % 2 === 0) {
                wordDiv.classList.add(`bg-${currentTheme}-800`);
            } else {
                wordDiv.classList.add(`bg-${currentTheme}-400`)
            }
            lyricPos.appendChild(wordDiv);
        }
    }
}

function updateTimingsFromMarkers() {
    let cnt = 0;
    const markers = document.getElementsByClassName('wordMarkers');
    for (let i = 0; i < songLyrics.length; i++) {
        for ( let j = 0; j < songLyrics[i].line.length; j++) {
            const multiplier = parseFloat(markers[cnt].style.left.replace('%', ''));
            songLyrics[i].line[j].timing = percentToMs(multiplier, songPlayer.duration);
            cnt++;
        }
        songLyrics[i].timing = songLyrics[i].line[0].timing - 200;
    }
}

// Convert helpers
function msToPercent (ms, duration) {
    return (ms + 100) / duration / 10;
}

function percentToMs(percent, duration) {
    return Math.round(((percent * duration) * 10) - 100);
}

// Makes markers dragable
function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        elmnt.onmousedown = dragMouseDown;
    }
    function dragMouseDown(e) {
        e = e || window.event;
        pos2 = parseInt(e.clientX);
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
        return false;
    }

    function elementDrag(e) {
        e = e || window.event;
        pos1 = pos2 - parseInt(e.clientX);
        pos2 = parseInt(e.clientX);
        let percentPos = (elmnt.offsetLeft - pos1) / lyricPos.clientWidth * 100;
        elmnt.style.left = percentPos + "%";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        updateTimingsFromMarkers();
    }
}

// Prepare form content
function formDataFromForm(form){

    let formData = new FormData();
    [...form].forEach(el => {
        let nodeName = el.nodeName.toLowerCase();
        let type = el.getAttribute("type");
        let key = el.getAttribute("id");
        let value;

        switch(nodeName){
            case "select":
            value = el.selectedOptions[0].value;
            break;

            case "input":
            case "textarea":
            switch(type){

                case "file":
                value = el.files[0];
                break;
    
                default:
                value = el.value;
                break;
            }
            break;

            default:
            return;
            break;
        }
        formData.append(key, value);
        
    });
    return formData;

}

// Fetch API content
function fetchGetLyrics(songName) {
    fetch(`/api/getLyrics/${songName}`, {
        method: 'GET'
    })
    .then(async response => {
        const data = await response.json();

        // check for error response
        if (!response.ok) {
            // get error message from body or default to response status
            const error = (data && data.message) || response.status;
            return Promise.reject(error);
        }

        songLyrics = data;
        setTimeout(() => {
            makeLineMarkers();
            const markers = document.getElementsByClassName('markers');
            for(i = 0; i < markers.length; i++) {
                dragElement(markers[i]);
            }
        }, 250);

    })
    .catch(error => {
        console.error('There was an error!', error);
    });
}

function postData(data, URL){
    let options = {method: 'POST'};


    if(data instanceof FormData){
        options.body = data;
    } else {
        options.headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };
        options.body = JSON.stringify(data);
    } 

    return new Promise((resolve, reject) => {
        fetch(URL, options)
        .then(response => response.text())
        .then((responseText) => {
            try {
                let json = JSON.parse(responseText);
                resolve(json);
                location.href = '/';
            } catch {
                resolve(responseText);
                location.href = '/';
            }
        });
    });
}

function fetchPutLyrics(songName, lyrics) {
    const reqObj = {
        songName: songName,
        lyrics: lyrics
    };
    const jsonObj = JSON.stringify(reqObj);
    fetch('/api/updateLyrics', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: jsonObj
    })
    .then(async response => {
        const data = await response.json();

        // check for error response
        if (!response.ok) {
            // get error message from body or default to response status
            const error = (data && data.message) || response.status;
            return Promise.reject(error);
        }
        
        document.getElementById('notification').classList.add('animate-notification');
        setTimeout(() => {
            document.getElementById('notification').classList.remove('animate-notification');
        }, 3000);
        songLyrics = data.lyrics;
        makeLineMarkers();
        const markers = document.getElementsByClassName('markers');

        for(i = 0; i < markers.length; i++) {
            dragElement(markers[i]);
        }
    })
    .catch(error => {
        console.error('There was an error!', error);
    });
}

function fetchGetMidiFile(songName) {
    fetch(`/api/midiFile/${songName}`, {
        method: 'GET'
    })
    .then( res => res.blob() )
    .then( blob => {
        let url = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = `${songName}.mid`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    });
}