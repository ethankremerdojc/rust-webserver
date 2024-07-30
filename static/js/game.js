//* INITIALIZING / CREATING

function initializeGame() {
  let mapgen_uri = `/api/map_generation?seed=${INITIAL_SEED}`;

  const request = new Request(mapgen_uri, {method: "GET",});
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
      SEED_STATE = response.seed_state;
  
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
  
          MAP.appendChild(xrow);
      });
  
      MAP_HEIGHT = response.cells.length * TILE_SIZE;
      MAP_WIDTH = response.cells[0].length * TILE_SIZE;
  
      MAP.style.width = MAP_WIDTH + "px";
      MAP.style.height = MAP_HEIGHT + "px";
  
      startGame();
    })
    .catch((error) => {
      console.error(error);
  });
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

  MAP.appendChild(playerDiv);

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
  let bowImage = document.createElement("img");
  bowImage.src = "/static/images/png/bow.png";
  imageCacheDiv.appendChild(bowImage);
  let spearImage = document.createElement("img");
  spearImage.src = "/static/images/png/spear.png";
  imageCacheDiv.appendChild(spearImage);
  let heartImage = document.createElement("img");
  heartImage.src = "/static/images/png/heart.png";
  imageCacheDiv.appendChild(heartImage);
}

function initializeEnemyImages(imageCacheDiv) {
  let sprites = ["blue_slime"]; // , "green_slime"
  let dirPath = "/static/images/png/";
  let animationCount = 6;

  for (let sprite of sprites) {
    let spritePath = dirPath + sprite + "/";

    for (let imgType of ["idle", "moving"]) {
      // "/static/images/png/blue_slime/idle/"
      let typePath = spritePath + imgType + "/";

      for (let i = 1; i < animationCount + 1; i++) {
        let imgPath = typePath + i + ".png";
        let img = document.createElement("img");
        img.src = imgPath;
        imageCacheDiv.appendChild(img);
      }
    }
  }
}

function createEnemy(x, y, map, additionalClass, hitpoints=1, speed=1.0) {
  //todo add enemy speed attribute
  let enemyDiv = document.createElement("span");
  enemyDiv.className = "enemy";
  enemyDiv.classList.add(additionalClass);
  enemyDiv.style.bottom = y + "px";
  enemyDiv.style.left = x + "px";

  enemyDiv.setAttribute("health", hitpoints);
  enemyDiv.setAttribute("speed", speed);

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

  MAP.appendChild(enemyDiv);
}

//* WEAPONS FUNCTIONALITY

function getCenter(element) {
  const {left, top, width, height} = element.getBoundingClientRect();
  return {x: left + width / 2, y: top + height / 2}
}

function useWeapon(e, cname) {
  if (!WEAPON_IN_USE) { WEAPON_IN_USE = true; } else { return }
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
  let offset = document.querySelector('#map').getBoundingClientRect();
  let x = e.clientX - offset.left;
  let y = offset.bottom - e.clientY;

  summonArrow(playerX, playerY, x , y, angle);

  setTimeout(() => {
    weapon.style.display = "none"; 
    weapon.style.opacity = "0"; 
  }, 490)

  setTimeout(() => { weapon.style.opacity = "1"; WEAPON_IN_USE = false }, 700)
}

function handleSpearUse(weapon) {
  setTimeout(() => {weapon.style.bottom = "16px"}, 4);
  setTimeout(() => {weapon.style.bottom = "-8px"}, 314);

  setTimeout(() => {
    weapon.style.display = "none"; 
    weapon.style.opacity = "0"; 
  }, 490)

  setTimeout(() => { weapon.style.opacity = "1"; WEAPON_IN_USE = false }, 700)
}

function moveArrow(arrow, dx, dy, speed) {

  let newX = Number(arrow.style.left.replace("px", "")) + (dx * speed);
  let newY = Number(arrow.style.bottom.replace("px", "")) + (dy * speed);

  arrow.style.left = newX + "px";
  arrow.style.bottom = newY + "px";

  // check if leaves the map, or collides with anything

  // if not touching water or land, this arrow should get deleted.
  if (!(checkIfCollidedWithClass(arrow, "water") || checkIfCollidedWithClass(arrow, "dirt"))) {
    setTimeout(() => MAP.removeChild(arrow), 20);
    return
  }

  if (checkIfCollidedWithClass(arrow, "enemy") || checkIfCollidedWithClass(arrow, "tree") || checkIfCollidedWithClass(arrow, "rock")) {
    setTimeout(() => MAP.removeChild(arrow), 27);
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
  MAP.appendChild(arrow);

  moveArrow(arrow, dx, dy, speed);
}

//* MOVEMENT

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

  //todo deal with enemies glitching back and forth because if the speed is not a multiple of player speed then it will overshoot continuially

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

  let speed = Number(enemy.getAttribute("speed"));

  if (player_y > enemy_y) { delta_y = speed; }
  if (player_y < enemy_y) { delta_y = -speed; }
  if (player_x > enemy_x) { delta_x = speed; }
  if (player_x < enemy_x) { delta_x = -speed; }

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
  if (enemy_health <= 0) { 
    MAP.removeChild(enemy); 
    // check if there are no enemies left

    let totalEnemies = document.querySelectorAll(".enemy");
    if (totalEnemies.length == 0) {
      setTimeout(() => {
        incrementRound();
      }, 1000)

      return
    }
  }
  enemy.setAttribute("health", enemy_health);


  setTimeout(() => {enemy.classList.remove("hit")}, 400)
}

function collides(obj1, obj2) {
  let rect1 = obj1.getBoundingClientRect();
  let rect2 = obj2.getBoundingClientRect();

  return !(rect1.right < rect2.left || 
    rect1.left > rect2.right || 
    rect1.bottom < rect2.top || 
    rect1.top > rect2.bottom)
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
  // update both idle and moving images for simplicity, then display the one that is relevant based on moving let

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
    ALIVE = false;
  } else {
    setTimeout(() => {player.classList.remove("hit")}, 500);
  }
}

function removeAllSprites() {
  // remove all enemies, projectiles (arrows), and player.

  let enemies = MAP.querySelectorAll(".enemy");
  let player = MAP.querySelector("#player");
  let arrows = MAP.querySelectorAll(".arrow");

  for (let enemy of enemies) {
    MAP.removeChild(enemy);
  }
  MAP.removeChild(player);
  for (let arrow of arrows) {
    MAP.removeChild(arrow);
  }
}

function displayDeathPopup() {
  MAP.removeEventListener('click', clickFunc);
  let deathPopup = document.querySelector(".death-container");
  deathPopup.style.display = "flex";
}

function setAlive() {
  ALIVE = true;
  let deathPopup = document.querySelector(".death-container");
  deathPopup.style.display = "none"; 
}

function incrementRound() {

  let uri = `/api/get_round_data?seed=${INITIAL_SEED}&seed_state=${SEED_STATE}&round=${ROUND_NUMBER}`;
  console.log(uri);

  let get_round_data_request = new Request( //todo check ramifications of seed_state being set to initial seed.
    uri, 
    {method: "GET"});
  
  fetch(get_round_data_request)
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      } else {
        throw new Error("Something went wrong on API server!");
      }
    })
    .then((response) => {
      console.log(response)
      SEED_STATE = response.seed_state;
      ROUND_NUMBER ++;
      ROUND_NUMBER_DIV.innerHTML = ROUND_NUMBER;
      for (let enemy of response.enemies) {
        //todo add enemy speed to create enemy
        
        createEnemy(
          enemy.x * TILE_SIZE, 
          enemy.y * TILE_SIZE, 
          map, 
          "blue_slime", 
          enemy.health,
          enemy.speed
        );
      }
    })
    .catch((error) => {
      console.error(error);
  });
}

function startGame() {

  ROUND_NUMBER = 1

  //todo this request should also return the new seed and seed state 
  let uri = `/api/get_round_data?seed=${INITIAL_SEED}&seed_state=${INITIAL_SEED}&round=${ROUND_NUMBER}`;
  console.log(uri);

  const request = new Request(uri, {method: "GET",});
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
      SEED_STATE = response.seed_state;

      initializeImages();

      MAP.addEventListener('click', clickFunc);

      for (let enemy of response.enemies) {
        //todo add enemy speed to create enemy
        createEnemy(
          enemy.x * TILE_SIZE, 
          enemy.y * TILE_SIZE, 
          map, 
          "blue_slime", 
          enemy.health,
          enemy.speed
        );
      }

      createPlayer(
        12 * TILE_SIZE,
        12 * TILE_SIZE,
        map
      )

      addHearts();
      setAlive();
      setTimeout(doTick, 27);
    })
    .catch((error) => {
      console.error(error);
  });
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

  if (!ALIVE) { // the only place where ticks stop happening
    SEED_STATE = INITIAL_SEED;
    removeAllSprites();
    displayDeathPopup();
    return
  }

  if (!document.hasFocus() || IS_PAUSED) {
    if (!IS_PAUSED) {
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
  MAP.removeEventListener('click', clickFunc);
  IS_PAUSED = true;
  keys = [];
  
  let pauseContainer = document.querySelector(".pause-container");
  pauseContainer.style.display = "flex"
}

function unpause() {
  IS_PAUSED = false;
  let pauseContainer = document.querySelector(".pause-container");
  pauseContainer.style.display = "none";
  MAP.addEventListener('click', clickFunc);
}

//* INPUT HANDLING

let keys = [];

window.addEventListener("keydown",
  function(e){ keys[e.key] = true; }, false);

window.addEventListener('keyup',
  function(e){ keys[e.key] = false; }, false);

function clickFunc(e) {
  if (!IS_PAUSED) { useSpear(e) }
}

function overwriteRightClick(event) {
  if (IS_PAUSED) {
    event.preventDefault(); // Prevent the default right-click behavior
    return false;
  }

  if (event.button == 2) {
    event.preventDefault(); // Prevent the default right-click behavior
    useBow(event);
    return false;
  }
}

function getAnchor() {
  var currentUrl = document.URL,
  urlParts   = currentUrl.split('#');
  
  return (urlParts.length > 1) ? urlParts[1] : null;
}

//* LETS

const ROUND_NUMBER_DIV = document.getElementById("roundNumber");
let ROUND_NUMBER = 1;
ROUND_NUMBER_DIV.innerHTML = ROUND_NUMBER;

// below need to be -1 initially, will be treated as a const once fetched
let MAP_HEIGHT = -1; 
let MAP_WIDTH = -1

const TILE_SIZE = 36; // in pixels

let WEAPON_IN_USE = false;
let IS_PAUSED = false;
let ALIVE = true;

let anchor = getAnchor();
let INITIAL_SEED;
if (anchor) {
  INITIAL_SEED = Number(anchor);
} else {
  INITIAL_SEED = 1;
}

console.log(INITIAL_SEED)

let SEED_STATE = null;

//* HTML ELEMENTS

const MAP = document.getElementById("map");

const continueButton = document.getElementById("continue");
const restartButton = document.getElementById("restart");
continueButton.onclick = unpause;
restartButton.onclick = startGame;

initializeGame();