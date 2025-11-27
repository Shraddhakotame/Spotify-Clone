let currentsong = new Audio();
let songs;
let cur_folder;

//To convert the sec to min

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "Invalid input";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}


async function getsongs(folder) {  //Load specific folder not a entire songs
  cur_folder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
  let response = await a.text();
  let div = document.createElement("div")
  div.innerHTML = response;
  let as = div.getElementsByTagName("a")
  songs = []
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1])
    }
  }

  //Show all songs in playlist 
  let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML = songUL.innerHTML + `<li>
            <img  class="invert" src="img/music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Author</div>
                
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert"  src="img/play.svg" alt="">
            </div></li> `;
  }

  // Attach an event listener to each song
  Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", element => {
      // console.log(e.querySelector(".info").firstElementChild.innerHTML)
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
    });

  });

  return songs;

}

const playMusic = (track, pause = false) => {
  currentsong.src = `/${cur_folder}/` + decodeURIComponent(track)
  if (!pause) {
    currentsong.play()
    play.src = "img/pause.svg"
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track)
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}

async function main() {
  //Get  the list of all the songs
  await getsongs("songs/Fav_Songs")  //Default songs from fav songs folder 
  playMusic(songs[0], true)


  //Attach an event listener to play ,next and pre
  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play()
      play.src = "img/pause.svg"
    }
    else {
      currentsong.pause()
      play.src = "img/play.svg"
    }
  })

  //time update 

  currentsong.addEventListener("timeupdate", () => {

    // Duration still loading → avoid invalid input
    if (isNaN(currentsong.duration)) {
      document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
      return;
    }

    // console.log(currentsong.currentTime, currentsong.duration);
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`

    // Add an event listner to  Fixed Seekbar circle movement
    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  })

  //Add an event listenerr to seek bar 

  document.querySelector(".seekbar").addEventListener("click", e => {
    let rect = e.target.getBoundingClientRect();
    let percent = (e.offsetX / rect.width) * 100;

    document.querySelector(".circle").style.left = percent + "%";

    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });

  // Add an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0"
  })

  //Add an event listner for close
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%"
  })

  //Add an event listner to prv and next

  pre.addEventListener("click", () => {
    // console.log("Prv clicked");
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
    if ((index - 1) >= 0) {
      playMusic(songs[index - 1])
    }
  })

  next.addEventListener("click", () => {
    // console.log("next clicked");
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
    if ((index + 1) < songs.length) {
      playMusic(songs[index + 1])
    }
  })

  //Add event listner to volume

  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    // console.log("setting volume to", e.target.value)
    currentsong.volume = parseInt(e.target.value) / 100
  })


  //Load the playlist whenever card is click
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    // console.log(e)
    e.addEventListener("click", async item => {
      songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
    })
  })

  const playbar = document.querySelector(".playbar");

  // When clicking a card- show playbar
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => {
      playbar.style.display = "flex";  
    });
  });


}
main()
