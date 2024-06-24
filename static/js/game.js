const TILE_SIZE = 36;
let map_height = -1;
let map_width = -1

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

    createPlayer(332, 368, map);
    createEnemy(400, 120, map, "orange", 3);
    createEnemy(120, 170, map, "blue");
    createEnemy(220, 420, map, "blue");
    createEnemy(520, 520, map, "blue");
    createEnemy(420, 370, map, "blue");
    createEnemy(320, 120, map, "blue");
    doTick();
  })
  .catch((error) => {
    console.error(error);
  });

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

function createEnemy(x, y, map, additionalClass, hitpoints=1) {
  let enemyDiv = document.createElement("span");
  enemyDiv.className = "enemy";
  enemyDiv.classList.add(additionalClass);
  enemyDiv.style.bottom = y + "px";
  enemyDiv.style.left = x + "px";

  enemyDiv.setAttribute("health", hitpoints);

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

  // style.bottom is to move weapon in and out. This won't be applicable for weapons other than spears
  setTimeout(() => {weapon.style.bottom = "16px"}, 4);
  setTimeout(() => {weapon.style.bottom = "-14px"}, 314);

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
  }
}

function moveEnemy(enemy){
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

  let initial_left = enemy.style.left;
  let initial_bottom = enemy.style.bottom;

  enemy.style.left = leftPx;
  if (checkIfCollidedWithClass(enemy, "rock") || checkIfCollidedWithClass(enemy, "tree") || checkIfCollidedWithClass(enemy, "water")|| checkIfCollidedWithClass(enemy, "enemy")) {
    enemy.style.left = initial_left;
  }

  enemy.style.bottom = bottomPx;
  if (checkIfCollidedWithClass(enemy, "rock") || checkIfCollidedWithClass(enemy, "tree") || checkIfCollidedWithClass(enemy, "water")|| checkIfCollidedWithClass(enemy, "enemy")) {
    enemy.style.bottom = initial_bottom;
  }

  if (checkIfCollidedWithClass(enemy, "spear")) {
    if (enemy.classList.contains("hit")) { return }

    enemy.classList.add("hit");

    
    let enemy_health = Number(enemy.getAttribute("health"));
    console.log(enemy_health);
    enemy_health -= 1;

    if (enemy_health == 0) { map.removeChild(enemy); }

    enemy.setAttribute("health", enemy_health);
    setTimeout(() => {enemy.classList.remove("hit")}, 500)
  }
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

function doTick() {

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
    moveEnemy(enemy);
  }

  if (checkIfCollidedWithClass(player, "enemy") && !player.classList.contains("hit")) {
    player.classList.add("hit");

    let heartsBlock = document.getElementById("hearts");
    let hearts = heartsBlock.querySelectorAll(".heart");

    if (hearts.length > 0) {
      let last = hearts[hearts.length - 1];
      last.parentNode.removeChild(last);
    }

    setTimeout(() => {player.classList.remove("hit")}, 500);
  }
  
  setTimeout(doTick, 20);
}