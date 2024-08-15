console.log("Hello Welcome To The Spotify");

let cur_song = new Audio();
let songs;
let cur_folder;

// function convertSecondsToMMSS(seconds) {
//     let date = new Date(0);
//     date.setSeconds(seconds);
//     let timeString = date.toISOString().substr(14, 5);
//     return timeString;
// }

function convertSecondsToMMSS(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        // return "Invalid inputs";
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formmattedMinutes = String(minutes).padStart(2, '0');
    const formmattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formmattedMinutes}:${formmattedSeconds}`;
}

async function library_list(folder) {

    cur_folder = folder;
    // let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let a = await fetch(`/${folder}/`);
    // let a = await fetch(`/songs/1-Sidhu-MooseWala/`)
    let respones = await a.text();

    let div = document.createElement("div")
    div.innerHTML = respones;

    let as = div.getElementsByTagName("a")

    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // Show All Songs In The Library List
    let song_list = document.querySelector(".left-header").getElementsByTagName("ul")[0]
    song_list.innerHTML = ""

    for (const song of songs) {
        // song_list.innerHTML = song_list.innerHTML + song;
        // song_list.innerHTML = song_list.innerHTML + `<li> ${song.replaceAll("" , " ").replaceAll("_" , " ")} </li>`;
        song_list.innerHTML = song_list.innerHTML + `<li> 
                                                        <div class="song-info">
                                                            <div class="song-left">
                                                                <img src="images/music.svg" alt="music">
                                                                <p>${song.replaceAll("%20", " ")}</p>
                                                            </div>
                                                            <div class="song-right">
                                                                <p>Play Now</p>
                                                                <button>
                                                                    <img src="images/pause.svg" alt="play">
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </li>`;
    }

    // Add An Event Listener For Each And Every Song
    Array.from(document.querySelector(".left-header").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".song-left>p").innerHTML)
            play_music(e.querySelector(".song-left>p").innerHTML.trim())
        })
    })

    return songs

}

const play_music = (track, pause = false) => {
    // let play = new Audio("/songs/" + track);
    cur_song.src = `/${cur_folder}/` + track;
    if (!pause) {
        cur_song.play();
        play.src = "images/play.svg";
    }
    document.querySelector(".song-details").innerHTML = decodeURI(track);
    document.querySelector(".song-duration").innerHTML = "00:00 / 00:00";

}

async function put_albums() {
    let a = await fetch('/songs/')
    let respones = await a.text();

    let div = document.createElement("div")
    div.innerHTML = respones

    let anchors = div.getElementsByTagName("a")

    let play_container = document.querySelector(".play-container")

    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
        // if (e.href.includes("/songs")) {

            let folder = e.href.split("/").slice(-2)[0]

            // Get Metadata Of The Folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let respones = await a.json();

            play_container.innerHTML = play_container.innerHTML + ` <div data-folder="${folder}" class="song-container">
                                                                        <button class="pos">
                                                                           <img class="btn" src="images/play-button.png" alt="play">
                                                                        </button>
                                                                        <img class="img" src="/songs/${folder}/cover.jpeg" alt="play-image">
                                                                        <h2>${respones.title}</h2>
                                                                        <p>${respones.description}</p>
                                                                    </div>`
        }
    }

    // Load The Library Whenever "song-container" Is Clicked
    Array.from(document.getElementsByClassName("song-container")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await library_list(`songs/${item.currentTarget.dataset.folder}`)
            play_music(songs[0])
        })
    })
}

async function put_library_list() {

    // This Will Add A Default Song List In The Library
    songs = await library_list("songs/Top-Songs")
    // songs = await library_list("songs/Main-Musics")

    console.log(songs)

    play_music(songs[0], true)

    // Display All The Albums On The Pages
    put_albums()

    // Get references to and the start_stop
    let start_stop = document.getElementById("play");

    // Add an event listener to the button
    start_stop.addEventListener("click", function () {
        // Check if the audio is currently playing
        if (cur_song.paused) {
            // If it's paused, play the audio and change the button icon to "Pause"
            cur_song.play();
            play.src = "images/play.svg";
        }
        else {
            // If it's playing, pause the audio and change the button icon to "Play"
            cur_song.pause();
            play.src = "images/pause.svg";
        }
    });

    // Add An Event Listener For Time Update In The Song Path
    cur_song.addEventListener("timeupdate", () => {
        document.querySelector(".song-duration").innerHTML = `${convertSecondsToMMSS(cur_song.currentTime)} / ${convertSecondsToMMSS(cur_song.duration)}`
        document.querySelector(".point").style.left = (cur_song.currentTime / cur_song.duration) * 97 + "%";
    })

    // Add An Event Listener For Move Any Where In The Song Path
    document.querySelector(".path").addEventListener("click", e => {
        let move = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".point").style.left = move + "%";
        cur_song.currentTime = ((cur_song.duration) * move) / 100;
    })

    // Add An Event Listener For Show The Hamburger
    document.querySelector(".move-menu").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%";
    })

    // Add An Event Listener For Hide The Hamburger
    document.querySelector(".move-close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-200%";
    })

    // Add An Event Listener For The Previous Song
    previous.addEventListener("click", () => {
        let index = songs.indexOf(cur_song.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            play_music(songs[index - 1])
        }
        console.log(index)
    })

    // Add An Event Listener For The Next Song
    next.addEventListener("click", () => {
        let index = songs.indexOf(cur_song.src.split("/").slice(-1)[0])
        if ((index + 1) <= songs.length - 1) {
            play_music(songs[index + 1])
        }
        console.log(index)
    })

}

put_library_list()
