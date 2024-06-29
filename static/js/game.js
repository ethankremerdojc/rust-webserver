function createBaseSetup() {
  createPlayer(332, 368, map);

  initializeImages();

  createEnemy(400, 120, map, "blue", 3);
  createEnemy(120, 170, map, "blue", 2);
  createEnemy(220, 420, map, "blue", 4);
  createEnemy(520, 520, map, "blue", 6);
  createEnemy(420, 370, map, "blue", 7);
  createEnemy(320, 120, map, "blue", 11);
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

  let bow = document.createElement("img");
  bow.src = "/static/images/png/bow.png";
  bow.className = "bow";
  weaponBox.appendChild(bow);
}

function initializeImages() {
  let imageCacheDiv = document.querySelector(".image-cache");
  initializeEnemyImages(imageCacheDiv);

  let arrowImage = document.createElement("img");
  arrowImage.src = "/static/images/png/arrow.png";
  imageCacheDiv.appendChild(arrowImage);
}

function initializeEnemyImages(imageCacheDiv) {
  let sprites = ["blue_slime"]; // , "green_slime"
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

  let mainDirPath = "/static/images/png/blue_slime/"; // green_slime

  enemyDiv.setAttribute("framenumber", frameNumber);
  enemyDiv.setAttribute("framecount", imageCount);
  enemyDiv.setAttribute("imagespath", mainDirPath);

  // instead use one image, and change the source. Have the image somewhere on the page so it doesn't 
  // need to be collected


  let idleDirPath = mainDirPath + "idle/";

  let imagePath = idleDirPath + "1" + ".png";
  let image = document.createElement("img");
  image.src = imagePath;
  enemyDiv.appendChild(image);

  map.appendChild(enemyDiv);
}

function getCenter(element) {
  const {left, top, width, height} = element.getBoundingClientRect();
  return {x: left + width / 2, y: top + height / 2}
}

function useWeapon(e, cname) {
  if (!weaponInUse) { weaponInUse = true; } else { return }
  let player = document.getElementById("player");
  let weaponBox = player.querySelector(".weapon-box");
  let weapon = weaponBox.querySelector("." + cname);
  
  if (weapon.style.display == "block" || weapon.style.opacity == "0") { return }
  
  let playerCenter = getCenter(player);
  const angle = Math.atan2(e.clientY - playerCenter.y, e.clientX - playerCenter.x) + (Math.PI / 2);

  weaponBox.style.transform = `rotate(${angle}rad)`;
  weapon.style.display = "block";
  
  if (cname == "spear") {
    handleSpearUse(weapon);
  } else if (cname == "bow") {
    handleBowUse(e, player, weapon, angle);
  }
}

function useSpear(e) {
  useWeapon(e, "spear")
}

function useBow(e) {
  useWeapon(e, "bow")
}

function handleBowUse(e, player, weapon, angle) {
  let playerX = Number(player.style.left.replace("px", ""));
  let playerY = Number(player.style.bottom.replace("px", ""));
  var offset = document.querySelector('#map').getBoundingClientRect();
  let x = e.clientX - offset.left;
  let y = offset.bottom - e.clientY;

  summonArrow(playerX, playerY, x , y, angle);

  setTimeout(() => {
    weapon.style.display = "none"; 
    weapon.style.opacity = "0"; 
  }, 490)

  setTimeout(() => { weapon.style.opacity = "1"; weaponInUse = false }, 700)
}

function handleSpearUse(weapon) {
  setTimeout(() => {weapon.style.bottom = "16px"}, 4);
  setTimeout(() => {weapon.style.bottom = "-8px"}, 314);

  setTimeout(() => {
    weapon.style.display = "none"; 
    weapon.style.opacity = "0"; 
  }, 490)

  setTimeout(() => { weapon.style.opacity = "1"; weaponInUse = false }, 700)
}

function moveArrow(arrow, dx, dy, speed) {

  let newX = Number(arrow.style.left.replace("px", "")) + (dx * speed);
  let newY = Number(arrow.style.bottom.replace("px", "")) + (dy * speed);

  arrow.style.left = newX + "px";
  arrow.style.bottom = newY + "px";

  // check if leaves the map, or collides with anything

  // if not touching water or land, this arrow should get deleted.
  if (!(checkIfCollidedWithClass(arrow, "water") || checkIfCollidedWithClass(arrow, "dirt"))) {
    setTimeout(() => map.removeChild(arrow), 20);
    return
  }

  if (checkIfCollidedWithClass(arrow, "enemy") || checkIfCollidedWithClass(arrow, "tree") || checkIfCollidedWithClass(arrow, "rock")) {
    setTimeout(() => map.removeChild(arrow), 27);
    return
  } else {
    setTimeout(() => moveArrow(arrow, dx, dy, speed), 12);
  }
}

function summonArrow(startX, startY, mouseX, mouseY, angle) {
  let xdif = mouseX - startX;
  let ydif = mouseY - startY;

  let length = Math.sqrt(xdif*xdif + ydif*ydif);

  let speed = 3;

  let dx = xdif / length;
  let dy = ydif / length;

  let arrow = document.createElement("img");
  arrow.src = "/static/images/png/arrow.png";
  arrow.style.transform = `rotate(${angle}rad)`;

  arrow.style.left = startX + "px";
  arrow.style.bottom = startY + "px";
  arrow.className = "arrow";
  map.appendChild(arrow);

  moveArrow(arrow, dx, dy, speed);
}

function collides(obj1, obj2) {
  let rect1 = obj1.getBoundingClientRect();
  let rect2 = obj2.getBoundingClientRect();

  return !(rect1.right < rect2.left || 
    rect1.left > rect2.right || 
    rect1.bottom < rect2.top || 
    rect1.top > rect2.bottom)
}

function movePlayer(even){
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

    if (checkIfCollidedWithClass(player, "water") && even) { // essentially halves speed in water
      return true
    }
  
    player.style.left = leftPx;
    if (checkIfCollidedWithClass(player, "rock") || checkIfCollidedWithClass(player, "tree")) {
      player.style.left = initial_left;
    }

    player.style.bottom = bottomPx;
    if (checkIfCollidedWithClass(player, "rock") || checkIfCollidedWithClass(player, "tree")) {
      player.style.bottom = initial_bottom;
    }
  }
}

function moveEnemy(enemy, even){ // returns bool moving
  // when enemy has been hit, just don't move until iframes gone
  if (enemy.classList.contains("hit")) { return } 

  const player = document.getElementById("player");

  let enemy_y = Number(enemy.style.bottom.replace("px", ""));
  let enemy_x = Number(enemy.style.left.replace("px", ""));
  
  let player_y = Number(player.style.bottom.replace("px", ""));
  let player_x = Number(player.style.left.replace("px", ""));

  let x_in_range = enemy_x - 320 < player_x && player_x < enemy_x + 320;
  let y_in_range = enemy_y - 320 < player_y && player_y < enemy_y + 320;

  if (!(x_in_range && y_in_range)) { return }

  let delta_y = 0;
  let delta_x = 0;

  if (player_y > enemy_y) { delta_y = 1; }
  if (player_y < enemy_y) { delta_y = -1; }
  if (player_x > enemy_x) { delta_x = 1; }
  if (player_x < enemy_x) { delta_x = -1; }

  let bottomPx = (enemy_y + delta_y) + "px";
  let leftPx = (enemy_x + delta_x) + "px";

  let leftMoving = true;
  let bottomMoving = true;
  let initial_left = enemy.style.left;
  let initial_bottom = enemy.style.bottom;

  if (checkIfCollidedWithClass(enemy, "water") && even) { return true } // 50% of the time we want to do nothing to slow down

  if (checkIfCollidedWithClass(enemy, "spear")) {
    removeHealthOrKill(enemy, 3)
  }

  if (checkIfCollidedWithClass(enemy, "sword")) {
    removeHealthOrKill(enemy, 2)
  }

  enemy.style.left = leftPx;
  if (checkIfCollidedWithClass(enemy, "rock") || checkIfCollidedWithClass(enemy, "tree") || checkIfCollidedWithClass(enemy, "enemy")) {
    enemy.style.left = initial_left;
    leftMoving = false;
  }

  enemy.style.bottom = bottomPx;
  if (checkIfCollidedWithClass(enemy, "rock") || checkIfCollidedWithClass(enemy, "tree") || checkIfCollidedWithClass(enemy, "enemy")) {
    enemy.style.bottom = initial_bottom;
    bottomMoving = false;
  }

  if (leftMoving || bottomMoving) { return true } else { return false }
}

function removeHealthOrKill(enemy, damage=1) {
  enemy.classList.add("hit");

  let enemy_health = Number(enemy.getAttribute("health"));
  enemy_health -= damage;
  if (enemy_health <= 0) { map.removeChild(enemy); }
  enemy.setAttribute("health", enemy_health);

  setTimeout(() => {enemy.classList.remove("hit")}, 400)
}

function checkIfCollidedWithClass(element, c) {
  let objs = document.getElementsByClassName(c);

  for (let obj of objs) {
    if (obj == element) { continue }
    if (collides(element, obj)) { return true }
  }

  return false
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

function removeHeartOrKill(player) {
  player.classList.add("hit");

  let heartsBlock = document.getElementById("hearts");
  let hearts = heartsBlock.querySelectorAll(".heart");

  let last = hearts[hearts.length - 1];
  last.parentNode.removeChild(last);
  if (hearts.length <= 1) {
    alive = false;
  } else {
    setTimeout(() => {player.classList.remove("hit")}, 500);
  }
}

function removeAllSprites() {
  // remove all enemies, projectiles (arrows), and player.

  let enemies = map.querySelectorAll(".enemy");
  let player = map.querySelector("#player");
  let arrows = map.querySelectorAll(".arrow");

  for (var enemy of enemies) {
    map.removeChild(enemy);
  }
  map.removeChild(player);
  for (var arrow of arrows) {
    map.removeChild(arrow);
  }
}

function displayDeathPopup() {
  map.removeEventListener('click', clickFunc);
  let deathPopup = document.querySelector(".death-container");
  deathPopup.style.display = "flex";
}

function setAlive() {
  alive = true;
  let deathPopup = document.querySelector(".death-container");
  deathPopup.style.display = "none"; 
}

function startGame() {
  map.addEventListener('click', clickFunc);
  createBaseSetup();
  addHearts();
  setAlive();
  setTimeout(doTick, 27);
}

function addHearts(count=5) {
  // <img class="heart" src="/static/images/png/heart.png" />

  let heartsDiv = document.querySelector(".hearts");
  
  for (i=0; i < count; i++) {
    let heart = document.createElement("img");
    heart.src = "/static/images/png/heart.png";
    heart.className = "heart";
    heartsDiv.appendChild(heart);
  }
}

function doTick(even=false) {

  if (!alive) { // the only place where ticks stop happening
    removeAllSprites();
    displayDeathPopup();
    return
  }

  if (!document.hasFocus() || isPaused) {
    if (!isPaused) {
      pause();
    }
    setTimeout(doTick, 27);
    return
  }

  const player = document.getElementById("player");

  movePlayer(even);
  
  let enemies = document.getElementsByClassName("enemy");
  
  for (let enemy of enemies) {
    let moving = moveEnemy(enemy, even);
  
    if (checkIfCollidedWithClass(enemy, "arrow")) {
      removeHealthOrKill(enemy, 1)
    }

    if (even) {
      animate(enemy, moving);
    }
  }

  if (checkIfCollidedWithClass(player, "enemy") && !player.classList.contains("hit")) {
    removeHeartOrKill(player)
  }

  let newEven;
  if (even) {
    newEven = false
  } else {
    newEven = true
  }
  
  setTimeout(() => doTick(newEven), 27);
}

function pause() {
  map.removeEventListener('click', clickFunc);
  isPaused = true;
  keys = [];
  
  let pauseContainer = document.querySelector(".pause-container");
  pauseContainer.style.display = "flex"
}

function unpause() {
  isPaused = false;
  let pauseContainer = document.querySelector(".pause-container");
  pauseContainer.style.display = "none";
  map.addEventListener('click', clickFunc);
}

function getRoundDetails(cells, initialSeed, seedState) {

  let jsonData = { // essentially just send back the same data 
    "initial_seed": initialSeed,
    "seed_state": seedState,
    "cells": cells,
    "round_number": 5
  }

  const request = new Request("/api/round_details", {
    method: "POST",
    body: `${jsonData}`
  });
}

const TILE_SIZE = 36;

// need to be -1 initially, will be treated as a const later
let MAP_HEIGHT = -1; 
let MAP_WIDTH = -1

var weaponInUse = false;
var isPaused = false;

var alive = true;

let map = document.getElementById("map");
let cells = null;
let initialSeed = null;
let seedState = null;

const request = new Request("/api/map_generation?seed=99999&seedState=1992&round=4", {method: "GET",}); // ?seed=29
fetch(request)
  .then((response) => {
    if (response.status === 200) {
      return response.json();
    } else {
      throw new Error("Something went wrong on API server!");
    }
  })
  .then((response) => {
    console.log(response);

    cells = response.cells;
    initialSeed = response.initial_seed;
    seedState = response.seed_state;

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

    map.style.width = MAP_WIDTH + "px";
    map.style.height = MAP_HEIGHT + "px";

    startGame();
  })
  .catch((error) => {
    console.error(error);
});

var keys = [];

window.addEventListener("keydown",
  function(e){ keys[e.key] = true; }, false);

window.addEventListener('keyup',
  function(e){ keys[e.key] = false; }, false);

function clickFunc(e) {
  if (!isPaused) { useSpear(e) }
}

function overwriteRightClick(event) {
  if (isPaused) {
    event.preventDefault(); // Prevent the default right-click behavior
    return false;
  }

  if (event.button == 2) {
    event.preventDefault(); // Prevent the default right-click behavior
    useBow(event);
    return false;
  }
}

let continueButton = document.getElementById("continue");
continueButton.onclick = unpause;

let restartButton = document.getElementById("restart");
restartButton.onclick = startGame;