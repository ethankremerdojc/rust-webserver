console.log("Running Game")

// Make get request for base case

const TILE_SIZE = 36;
let map_height = -1;
let map_width = -1

const request = new Request("/api/map_generation", {
    method: "GET",
  });



fetch(request)
  .then((response) => {
    if (response.status === 200) {
      return response.json();
    } else {
      throw new Error("Something went wrong on API server!");
    }
  })
  .then((response) => {
    // console.log(response);
    const map = document.getElementById("map");

    response.cells.forEach(row => {
        let xrow = document.createElement("div");
        xrow.className = "tilerow";

        row.forEach(cell => {
            let ycol = document.createElement("div");
            ycol.className = "tile";

            if (cell == "blank") {
                ycol.style.background = "#8a5f36";
                ycol.classList.add("dirt");
            } else if (cell == "rock") {
                ycol.style.background = "grey";
                ycol.classList.add("rock");
            } else if (cell == "tree") {
                ycol.style.background = "green";
                ycol.classList.add("tree");
            } else if (cell == "water") {
                ycol.style.background = "blue";
                ycol.classList.add("water");
            } else {
                ycol.style.background = "white";
                ycol.classList.add("broken");
            }

            xrow.appendChild(ycol);
        })

        map.appendChild(xrow);

    });

    map_height = response.cells.length * TILE_SIZE;
    map_width = response.cells[0].length * TILE_SIZE;

    console.log({
      map_height: map_height,
      map_width: map_width
    });

    createPlayer(332, 368, map);
    doTick();
  xCollisionExists(185, 3, 20);
  })
  .catch((error) => {
    console.error(error);
  });

function createPlayer(x, y, map) {
  let playerDiv = document.createElement("div");
  playerDiv.id = "player";
  playerDiv.style.bottom = y + "px";
  playerDiv.style.left = x + "px";

  map.appendChild(playerDiv);
}

var keys = [];

window.addEventListener("keydown",
  function(e){
      keys[e.key] = true;
  },
false);

window.addEventListener('keyup',
  function(e){
      keys[e.key] = false;
  },
false);

function collides(obj1, obj2) {
  let rect1 = obj1.getBoundingClientRect();
  let rect2 = obj2.getBoundingClientRect();

  return !(rect1.right < rect2.left || 
    rect1.left > rect2.right || 
    rect1.bottom < rect2.top || 
    rect1.top > rect2.bottom)
}

function movePlayer(){
  let player_size = 20;
  const player = document.getElementById("player");

  let player_y = Number(player.style.bottom.replace("px", ""));
  let player_x = Number(player.style.left.replace("px", ""));

  let bottomPx;
  let leftPx;

  if(keys["w"]){
    if (! (player_y + player_size >= map_height)) {
      bottomPx = (player_y + 2) + "px";
    } 
  }

  if(keys["s"]){
    if (! (player_y <= 1)) {
      bottomPx = (player_y - 2) + "px";
    }
  }

  if(keys["d"]){
    if (! (player_x + player_size + 1 >= map_width)) {
      leftPx = (player_x + 2) + "px";
    } 
  }

  if(keys["a"]){
    if (! (player_x <= 0)) {
      leftPx = (player_x - 2) + "px";
    }
  }

  if (keys["w"] || keys["a"] || keys["s"] || keys["d"]) {
    let initial_left = player.style.left;
    let initial_bottom = player.style.bottom;
  
    player.style.left = leftPx;
    if (checkIfCollidedWithClass(player, "rock") || checkIfCollidedWithClass(player, "tree") || checkIfCollidedWithClass(player, "water")) {
      player.style.left = initial_left;
    }

    player.style.bottom = bottomPx;
    if (checkIfCollidedWithClass(player, "rock") || checkIfCollidedWithClass(player, "tree") || checkIfCollidedWithClass(player, "water")) {
      player.style.bottom = initial_bottom;
    }

    console.log(initial_left, initial_bottom)
  }
}

function checkIfCollidedWithClass(player, c) {
  let objs = document.getElementsByClassName(c);

  for (let obj of objs) {
    if (collides(player, obj)) {
      return true
    }
  }

  return false
}

function doTick() {
  movePlayer();
  setTimeout(doTick, 20);
}