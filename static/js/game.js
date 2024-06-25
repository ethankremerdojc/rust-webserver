const TILE_SIZE = 36;
let MAP_HEIGHT = -1;
let MAP_WIDTH = -1

const request = new Request("/api/map_generation", {method: "GET",}); // ?seed=29

let map = document.getElementById("map");;

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
    response.cells.forEach(row => {
        let xrow = document.createElement("span");
        xrow.className = "tilerow";

        row.forEach(cell => {
            let ycol = document.createElement("span");
            ycol.className = "tile";

            let cellParams = getTileParameters(cell);
            ycol.classList.add(cellParams["class"]);
            ycol.style.background = cellParams["background"];
            xrow.appendChild(ycol);
        })

        map.appendChild(xrow);

    });

    MAP_HEIGHT = response.cells.length * TILE_SIZE;
    MAP_WIDTH = response.cells[0].length * TILE_SIZE;
    createBaseSetup();
    doTick();
  })
  .catch((error) => {
    console.error(error);
  });

function createBaseSetup() {
  createPlayer(332, 368, map);

  initializeEnemyImages();

  createEnemy(400, 120, map, "orange", 3);
  createEnemy(120, 170, map, "blue", 2);
  createEnemy(220, 420, map, "blue", 2);
  createEnemy(520, 520, map, "yellow", 7);
  createEnemy(420, 370, map, "yellow", 7);
  createEnemy(320, 120, map, "yellow", 7);
}

function getTileParameters(cell) {
  let params = {
    "blank": {
      "background": "#8a5f36",
      "class": "dirt"
    },
    "rock": {
      "background": "grey",
      "class": "rock"
    },
    "tree": {
      "background": "green",
      "class": "tree"
    },
    "water": {
      "background": "blue",
      "class": "water"
    },
  }

  return params[cell]
}

function createPlayer(x, y, map) {
  let playerDiv = document.createElement("span");
  playerDiv.id = "player";
  playerDiv.style.bottom = y + "px";
  playerDiv.style.left = x + "px";

  map.appendChild(playerDiv);

  let weaponBox = document.createElement("div");
  player.appendChild(weaponBox);
  weaponBox.className = "weapon-box";

  let spear = document.createElement("img");
  spear.src = "/static/images/png/spear.png";
  spear.className = "spear";
  weaponBox.appendChild(spear);
}

function initializeEnemyImages() {
  let imageCacheDiv = document.querySelector(".image-cache");

  let sprites = ["blue_slime"];

  let dirPath = "/static/images/png/";

  let animationCount = 6;

  for (var sprite of sprites) {
    let spritePath = dirPath + sprite + "/";

    for (var imgType of ["idle", "moving"]) {
      // "/static/images/png/blue_slime/idle/"
      let typePath = spritePath + imgType + "/";

      for (var i = 1; i < animationCount + 1; i++) {
        let imgPath = typePath + i + ".png";
        let img = document.createElement("img");
        img.src = imgPath;
        imageCacheDiv.appendChild(img);
      }
    }
  }
}

function createEnemy(x, y, map, additionalClass, hitpoints=1) {
  let enemyDiv = document.createElement("span");
  enemyDiv.className = "enemy";
  enemyDiv.classList.add(additionalClass);
  enemyDiv.style.bottom = y + "px";
  enemyDiv.style.left = x + "px";

  enemyDiv.setAttribute("health", hitpoints);

  let imageCount = 6;
  let frameNumber = 1;

  let mainDirPath = "/static/images/png/blue_slime/";

  enemyDiv.setAttribute("framenumber", frameNumber);
  enemyDiv.setAttribute("framecount", imageCount);
  enemyDiv.setAttribute("imagespath", mainDirPath);

  // instead use one image, and change the source. Have the image somewhere on the page so it doesn't 
  // need to be collected


  let idleDirPath = mainDirPath + "idle/";

  let imagePath = idleDirPath + "1" + ".png";
  let image = document.createElement("img");
  image.className = "enemy-frame";
  image.src = imagePath;
  enemyDiv.appendChild(image);

  map.appendChild(enemyDiv);
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

function getCenter(element) {
  const {left, top, width, height} = element.getBoundingClientRect();
  return {x: left + width / 2, y: top + height / 2}
}

function useWeapon(e, cname) {
  let player = document.getElementById("player");
  let weaponBox = player.querySelector(".weapon-box");
  let weapon = weaponBox.querySelector("." + cname);
  
  if (weapon.style.display == "block" || weapon.style.opacity == "0") { return }
  
  let playerCenter = getCenter(player);
  const angle = Math.atan2(e.clientY - playerCenter.y, e.clientX - playerCenter.x) + (Math.PI / 2);
  weaponBox.style.transform = `rotate(${angle}rad)`;
  
  weapon.style.display = "block";

  //todo change how this func works based on weapon parameters

  // style.bottom is to move weapon in and out. This won't be applicable for weapons other than spears
  setTimeout(() => {weapon.style.bottom = "16px"}, 4);
  setTimeout(() => {weapon.style.bottom = "-8px"}, 314);

  // Opacity on weapon is used to do use time
  setTimeout(() => { weapon.style.display = "none"; weapon.style.opacity = "0"; }, 490)
  setTimeout(() => { weapon.style.opacity = "1"; }, 700)
}

function useSpear(e) {
  useWeapon(e, "spear");
}

map.addEventListener('click',
  (e) => {useSpear(e)},
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
    if (! (player_y + player_size >= MAP_HEIGHT)) {
      bottomPx = (player_y + 2) + "px";
    } 
  }

  if(keys["s"]){
    if (! (player_y <= 1)) {
      bottomPx = (player_y - 2) + "px";
    }
  }

  if(keys["d"]){
    if (! (player_x + player_size + 1 >= MAP_WIDTH)) {
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
  }
}

function moveEnemy(enemy){ // returns bool moving
  // when enemy has been hit, just don't move until iframes gone
  if (enemy.classList.contains("hit")) { return } 

  const player = document.getElementById("player");

  let enemy_y = Number(enemy.style.bottom.replace("px", ""));
  let enemy_x = Number(enemy.style.left.replace("px", ""));
  
  let player_y = Number(player.style.bottom.replace("px", ""));
  let player_x = Number(player.style.left.replace("px", ""));

  let x_in_range = enemy_x - 200 < player_x && player_x < enemy_x + 200;
  let y_in_range = enemy_y - 200 < player_y && player_y < enemy_y + 200;

  if (!(x_in_range && y_in_range)) { return }

  let delta_y = 0;
  let delta_x = 0;

  if (player_y > enemy_y) {
    delta_y = 1;
  }
  if (player_y < enemy_y) {
    delta_y = -1;
  }
  if (player_x > enemy_x) {
    delta_x = 1;
  }
  if (player_x < enemy_x) {
    delta_x = -1;
  }

  let bottomPx = (enemy_y + delta_y) + "px";
  let leftPx = (enemy_x + delta_x) + "px";

  let leftMoving = true;
  let bottomMoving = true;

  let initial_left = enemy.style.left;
  let initial_bottom = enemy.style.bottom;

  enemy.style.left = leftPx;
  if (checkIfCollidedWithClass(enemy, "rock") || checkIfCollidedWithClass(enemy, "tree") || checkIfCollidedWithClass(enemy, "water")|| checkIfCollidedWithClass(enemy, "enemy")) {
    enemy.style.left = initial_left;
    leftMoving = false;
  }

  enemy.style.bottom = bottomPx;
  if (checkIfCollidedWithClass(enemy, "rock") || checkIfCollidedWithClass(enemy, "tree") || checkIfCollidedWithClass(enemy, "water")|| checkIfCollidedWithClass(enemy, "enemy")) {
    enemy.style.bottom = initial_bottom;
    bottomMoving = false;
  }

  if (checkIfCollidedWithClass(enemy, "spear")) {
    removeHealthOrKill(enemy)
  }

  if (leftMoving || bottomMoving) { return true } else { return false }
}

function removeHealthOrKill(enemy) {
  enemy.classList.add("hit");
  let enemy_health = Number(enemy.getAttribute("health"));
  enemy_health -= 1;
  if (enemy_health == 0) { map.removeChild(enemy); }
  enemy.setAttribute("health", enemy_health);
  setTimeout(() => {enemy.classList.remove("hit")}, 400)
}

function checkIfCollidedWithClass(element, c) {
  let objs = document.getElementsByClassName(c);

  for (let obj of objs) {

    if (obj == element) {
      continue
    }

    if (collides(element, obj)) {
      return true
    }
  }

  return false
}

function doTick(even=false) {
  if (!document.hasFocus()) {
    keys = [];
    //todo show pause screen here
    setTimeout(doTick, 20);
    return
  }

  const player = document.getElementById("player");

  movePlayer();
  
  let enemies = document.getElementsByClassName("enemy");
  
  for (let enemy of enemies) {
    let moving = moveEnemy(enemy);

    if (even) {
      animate(enemy, moving);
    }
  }

  if (checkIfCollidedWithClass(player, "enemy") && !player.classList.contains("hit")) {
    removeHeart(player)
  }

  let newEven;
  if (even) {
    newEven = false
  } else {
    newEven = true
  }
  
  setTimeout(() => doTick(newEven), 26);
}

function removeHeart(player) {
  player.classList.add("hit");

  let heartsBlock = document.getElementById("hearts");
  let hearts = heartsBlock.querySelectorAll(".heart");

  if (hearts.length > 0) {
    let last = hearts[hearts.length - 1];
    last.parentNode.removeChild(last);
  }

  setTimeout(() => {player.classList.remove("hit")}, 500);
}

function animate(obj, moving) {
  // update both idle and moving images for simplicity, then display the one that is relevant based on moving var

  let frameNumber = Number(obj.getAttribute("framenumber"));
  let frameCount = Number(obj.getAttribute("framecount"));

  let nextFrame;

  if (frameNumber == frameCount) {
    nextFrame = 1;
  } else {
    nextFrame = frameNumber + 1;
  }

  // Set new src
  let baseImagePath = obj.getAttribute("imagespath");
  let statusString;

  if (moving) {
    statusString = "moving/"
  } else {
    statusString = "idle/"
  }

  let image = obj.querySelector("img");
  image.src = baseImagePath + statusString + nextFrame + ".png";

  obj.setAttribute("framenumber", nextFrame);
}