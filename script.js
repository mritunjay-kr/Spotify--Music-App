let currentSong = new Audio();
let songs;
let currFolder;
let currentTrackName = "";

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  seconds = Math.floor(seconds);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];

  for (let element of as) {
    if (element.href.endsWith(".mp3")) {
      songs.push(decodeURIComponent(element.href.split(`${folder}/`)[1]));
    }
  }

  let songUL = document.querySelector(".songList ul");
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML += `<li>
      <img class="invert" src="img/music.svg" alt="">
      <div class="info">
        <div>${song}</div>
        <div>Music MJ</div>
      </div>
      <div class="playnow">
        <span>Play Now</span>
        <img class="invert" src="img/play.svg" alt="Play button">
      </div>
    </li>`;
  }

  Array.from(songUL.getElementsByTagName("li")).forEach((e) => {
    e.addEventListener("click", () => {
      playMusic(e.querySelector(".info div").innerText.trim());
    });
  });

  return songs;
}

function playMusic(track, pause = false) {
  currentTrackName = track;
  currentSong.src = `${currFolder}/${track}`;
  currentSong.onloadedmetadata = () => {
    document.querySelector(".songtime").innerHTML = `00:00 / ${secondsToMinutesSeconds(currentSong.duration)}`;
  };
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
  let a = await fetch("songs/");
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  cardContainer.innerHTML = "";

  for (let e of anchors) {
    if (e.href.includes("songs/") && !e.href.endsWith("songs/")) {
      let parts = e.href.split("/").filter(Boolean);
      let folder = parts[parts.length - 1];

      try {
        let res = await fetch(`songs/${folder}/info.json`);
        let info = await res.json();

        let card = document.createElement("div");
        card.className = "card";
        card.dataset.folder = folder;
        card.innerHTML = `
          <div class="play">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 20V4L19 12L5 20Z" stroke="#141834" stroke-width="1.5" stroke-linejoin="round" />
            </svg>
          </div>
          <img src="songs/${folder}/cover.jpg" alt="album" />
          <h2>${info.title}</h2>
          <p>${info.description}</p>`;

        card.addEventListener("click", async () => {
          await getSongs(`songs/${folder}`);
        });

        cardContainer.appendChild(card);
      } catch (err) {
        console.error(`Error loading album ${folder}`, err);
      }
    }
  }
}

async function main() {
  await getSongs("songs/favsong");
  if (songs.length > 0) playMusic(songs[0], true);

  displayAlbums();
  displayTrending();
  displaySingers();
  displayRadios();

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    currentSong.currentTime = (currentSong.duration * percent) / 100;
    document.querySelector(".circle").style.left = percent + "%";
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%";
  });

  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentTrackName);
    if (index > 0) playMusic(songs[index - 1]);
  });

  next.addEventListener("click", () => {
    let index = songs.indexOf(currentTrackName);
    if (index + 1 < songs.length) playMusic(songs[index + 1]);
  });

  document.querySelector(".range input").addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
  });

  document.querySelector(".volume>img").addEventListener("click", e => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 1;
    }
  });
}

main();

async function displayTrending() {
  let a = await fetch("trendSong/");
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let trendingContainer = document.querySelector(".trendingSongs .cardContainer");
  trendingContainer.innerHTML = "";

  for (let e of anchors) {
    if (e.href.includes("trendSong/") && !e.href.endsWith("trendSong/")) {
      let parts = e.href.split("/").filter(Boolean);
      let folder = parts[parts.length - 1];

      try {
        let res = await fetch(`trendSong/${folder}/info.json`);
        let info = await res.json();

        let card = document.createElement("div");
        card.className = "card";
        card.dataset.folder = `trendSongs/${folder}`;
        card.innerHTML = `
          <div class="play">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 20V4L19 12L5 20Z" stroke="#141834" stroke-width="1.5" stroke-linejoin="round" />
            </svg>
          </div>
          <img src="trendSong/${folder}/cover.jpg" alt="album" />
          <h2>${info.title}</h2>
          <p>${info.description}</p>`;

        card.addEventListener("click", async () => {
          await getSongs(`trendSong/${folder}`);
        });

        trendingContainer.appendChild(card);
      } catch (err) {
        console.error(`Error loading trending album ${folder}`, err);
      }
    }
  }
}

async function displaySingers() {
  let a = await fetch("singers/");
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let singerContainer = document.querySelector(".popularSingers .cardContainer");
  singerContainer.innerHTML = "";

  for (let e of anchors) {
    if (e.href.includes("singers/") && !e.href.endsWith("singers/")) {
      let parts = e.href.split("/").filter(Boolean);
      let folder = parts[parts.length - 1];

      try {
        let res = await fetch(`singers/${folder}/info.json`);
        let info = await res.json();

        let card = document.createElement("div");
        card.className = "card";
        card.dataset.folder = `singers/${folder}`;
        card.innerHTML = `
          <div class="play">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 20V4L19 12L5 20Z" stroke="#141834" stroke-width="1.5" stroke-linejoin="round" />
            </svg>
          </div>
          <img src="singers/${folder}/cover.jpg" alt="album" />
          <h2>${info.title}</h2>
          <p>${info.description}</p>`;

        card.addEventListener("click", async () => {
          await getSongs(`singers/${folder}`);
        });

        singerContainer.appendChild(card);
      } catch (err) {
        console.error(`Error loading singer ${folder}`, err);
      }
    }
  }
}

async function displayRadios() {
  let a = await fetch("radios/");
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let radioContainer = document.querySelector(".popularRadios .cardContainer");
  radioContainer.innerHTML = "";

  for (let e of anchors) {
    if (e.href.includes("radios/") && !e.href.endsWith("radios/")) {
      let parts = e.href.split("/").filter(Boolean);
      let folder = parts[parts.length - 1];

      try {
        let res = await fetch(`radios/${folder}/info.json`);
        let info = await res.json();

        let card = document.createElement("div");
        card.className = "card";
        card.dataset.folder = `radios/${folder}`;
        card.innerHTML = `
          <div class="play">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 20V4L19 12L5 20Z" stroke="#141834" stroke-width="1.5" stroke-linejoin="round" />
            </svg>
          </div>
          <img src="radios/${folder}/cover.jpg" alt="album" />
          <h2>${info.title}</h2>
          <p>${info.description}</p>`;

        card.addEventListener("click", async () => {
          await getSongs(`radios/${folder}`);
        });

        radioContainer.appendChild(card);
      } catch (err) {
        console.error(`Error loading radio ${folder}`, err);
      }
    }
  }
}

document.querySelector('.signupbtn').addEventListener('click', function () {
  window.location.href = 'signup-signin/signup.html';
});

document.querySelector('.loginbtn').addEventListener('click', function () {
  window.location.href = 'signup-signin/login.html';
});
