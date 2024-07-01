const MAP_WIDTH: usize = 24;
const MAP_HEIGHT: usize = 24;

const SEED: u32 = 100; // 38
const MAX_SEED_SIZE: u32 = 33391; //33391; // all 3 of below are primes
const MULT_NUM: u32 = 3803; //3803;
const ADD_NUM: u32 = 7499; //7499;


// ENEMY CONSTS
const MAX_HEALTH_MULTIPLE: usize = 3;
const MAX_SPEED_MULTIPLE: f64 = 1.5;
const MAX_ENEMY_COUNT_MULTIPLE: usize = 4; // Starting round can have up to 3

const ENEMY_TYPES: [&str; 1] = ["blue_slime"];

#[derive(Debug)]
pub struct Enemy {
    health: usize,
    enemy_type: String,
    speed: f64,
    x: usize,
    y: usize
}

impl Enemy {

    fn json(&self) -> String {
        let health = self.health;
        let speed = self.speed;
        let x = self.x;
        let y = self.y;
        let t = &self.enemy_type;

        let json_contents = format!(
            "\"health\": {health}, \"speed\": {speed}, \"type\": \"{t}\", \"x\": {x}, \"y\": {y}");

        let mut results: String = "{".to_string();
        results += json_contents.as_str();
        results += "}";

        results
    }

    fn set_rand_value(&mut self, val: &str, seed_state: u32, round: usize) {
        match val {
            "health" => {
                let max_health = round * MAX_HEALTH_MULTIPLE;
                let mut health = (seed_state as usize) % max_health;

                if health == 0 {
                    health = 1
                }

                self.health = health
            },
            "speed" => {
                let max_speed = (round as f64) * MAX_SPEED_MULTIPLE;
                let mut speed = (seed_state as f64) % max_speed;

                if speed == 0.0 {
                    speed = 0.5
                }
                
                self.speed = speed
            },
            _ => {
                unimplemented!()
            }
        }
    }

    fn new() -> Enemy {
        Enemy {
            health: 0,
            enemy_type: "blue_slime".to_string(),
            speed: 1.0,
            x: 0,
            y: 0
        }
    }
}

#[derive(Default, Debug, Clone, Copy, PartialEq)]
enum CellState {
    #[default]
    Blank,
    Tree,
    Water,
    Rock
}

impl CellState {
    fn as_string(&self) -> &str {
        match &self {
            CellState::Blank => "blank",
            CellState::Tree => "tree",
            CellState::Water => "water",
            CellState::Rock => "rock",
        }
    }
}

#[derive(Debug)]
pub struct Map {
    cells: [[CellState; MAP_WIDTH]; MAP_HEIGHT],
    seed_state: u32 // set default to SEED
}

impl Map {
    fn new() -> Map {
        Map {
            cells: [[CellState::Blank; MAP_WIDTH]; MAP_HEIGHT],
            seed_state: SEED
        }
    }

    fn get_total_cell_count(&self) -> usize { MAP_HEIGHT * MAP_WIDTH }

    fn mutate_seed(&mut self) { self.seed_state = ((self.seed_state + ADD_NUM) * MULT_NUM) % MAX_SEED_SIZE; }

    fn generate_tiles(&mut self) {
        self.gen_rocks();
        self.gen_trees();
        self.gen_water_sources();
    }

    fn gen_rocks(&mut self) {
        let total_cell_count = self.get_total_cell_count();
        let max_rocks = total_cell_count / 9;

        for _ in 0..max_rocks {
            self.mutate_seed();
            
            if self.seed_state % 4 == 0 { 
                let (xpos, ypos) = self.rand_position();
                self.gen_rock(xpos, ypos);
            }
        }
    }

    fn gen_rock(&mut self, col: usize, row: usize) {
        self.cells[row][col] = CellState::Rock;
    }

    fn gen_trees(&mut self) {
        // adjust this function at some point to generate clump of trees instead of singular trees

        let total_cell_count = self.get_total_cell_count();
        let max_trees = total_cell_count / 4;
        for _ in 0..max_trees {

            self.mutate_seed();
            
            if self.seed_state % 5 == 0 {
                let (xpos, ypos) = self.rand_position(); 
                self.gen_tree(xpos, ypos);
            }
        }
    }

    fn gen_tree(&mut self, col: usize, row: usize) {
        self.cells[row][col] = CellState::Tree;
    }

    fn gen_water_sources(&mut self) {
        self.gen_lakes();
        self.gen_rivers();
    }

    fn gen_lakes(&mut self) {
        let total_cell_count = self.get_total_cell_count();
        let max_lakes = total_cell_count / 30;

        for _ in 0..max_lakes {

            self.mutate_seed();
            
            if self.seed_state % 3 == 0 {
                let (xp, yp) = self.rand_position();    
                let xpos: i32 = xp as i32;
                let ypos: i32 = yp as i32;
                
                let max_spread:usize = 7; // Each cell has 8 neighbors

                let mut positions: Vec<(usize, usize)> = Vec::new();

                positions.push((xp, yp));

                for _ in 0..max_spread {
                    self.mutate_seed();
                    for x in -1..2 {
                        for y in -1..2 {

                            self.mutate_seed();
                            if self.seed_state % 5 == 0 {

                                if x == -1 && xpos == 0 {
                                    continue
                                }
                                if x == 1 && xpos == (MAP_WIDTH - 1) as i32 {
                                    continue
                                }
                                if y == -1 && ypos == 0 {
                                    continue
                                }
                                if y == 1 && ypos == (MAP_HEIGHT - 1) as i32 {
                                    continue
                                }

                                let cellx: usize = (xpos + x) as usize;
                                let celly: usize = (ypos + y) as usize;

                                positions.push((cellx, celly));
                            }
                        }
                    }
                }

                for position in positions {
                    let (col, row) = position;
                    self.gen_water(col, row);
                }
            }
        }
    }

    fn gen_rivers(&mut self) {
        let total_cell_count = self.get_total_cell_count();
        let max_rivers = total_cell_count / 50;
        let max_river_length = total_cell_count / 36;

        for _ in 0..max_rivers {
            self.mutate_seed();

            let xpos: i32;
            let ypos: i32;

            // below statement forces river to spawn from edge of map
            if self.seed_state % 2 == 0 {
                self.mutate_seed();
                xpos = (self.seed_state % (MAP_WIDTH as u32)) as i32;
                
                if self.seed_state % 2 == 0 {
                    ypos = 0;
                } else {
                    ypos = (MAP_HEIGHT - 1) as i32;
                }
            } else {
                self.mutate_seed();
                ypos = (self.seed_state % (MAP_HEIGHT as u32)) as i32;
                
                if self.seed_state % 2 == 0 {
                    xpos = 0;
                } else {
                    xpos = (MAP_WIDTH - 1) as i32;
                }
            }

            let mut temp_x = xpos;
            let mut temp_y = ypos;

            let mut positions: Vec<(usize, usize)> = Vec::new();
            positions.push((temp_x as usize, temp_y as usize));

            for _ in 0..max_river_length {
                self.mutate_seed();
                let modx = self.seed_state % 3;
                let xdif: i32;
                match modx {
                    0 => xdif = -1,
                    1 => xdif = 0,
                    2 => xdif = 1,
                    _ => {panic!()}
                }

                self.mutate_seed();
                let mody = self.seed_state % 3;
                let ydif: i32;

                match mody {
                    0 => ydif = -1,
                    1 => ydif = 0,
                    2 => ydif = 1,
                    _ => {panic!()}
                }

                if xdif == -1 && ydif == -1 {continue}
                if xdif == 1 && ydif == 1 {continue}
                if xdif == -1 && temp_x == 0 {continue}
                if xdif == 1 && temp_x == (MAP_WIDTH - 1) as i32 {continue}
                if ydif == -1 && temp_y == 0 {continue}
                if ydif == 1 && temp_y == (MAP_HEIGHT - 1) as i32 {continue}

                let cellx: usize = (temp_x + xdif) as usize;
                let celly: usize = (temp_y + ydif) as usize;
                positions.push((cellx, celly));

                temp_x = temp_x + xdif;
                temp_y = temp_y + ydif;
            }

            for position in positions {
                let (col, row) = position;
                self.gen_water(col, row);
            }
        }
    }

    fn gen_water(&mut self, col: usize, row: usize) {
        self.cells[row][col] = CellState::Water;
    }

    fn rand_position(&mut self) -> (usize, usize) {
        let width: u32 = MAP_WIDTH as u32;
        let height: u32 = MAP_HEIGHT as u32;

        self.mutate_seed();
        let xpos: usize = (self.seed_state % width) as usize;
        self.mutate_seed();
        let ypos: usize = (self.seed_state % height) as usize;

        (xpos, ypos)
    }

    fn rand_empty_position(&mut self) -> (usize, usize) {
        let mut rand_position;

        loop {
            rand_position = self.rand_position();
            let cell_content: CellState = self.cells[rand_position.0][rand_position.1];
            if cell_content == CellState::Blank { break }
        }

        rand_position
    }

    fn generate_enemies(&mut self, round: usize) -> Vec<Enemy> {
        // pick random EMPTY tile
        // create random enemy object based on round 
        // Different types of enemies become available on different round numbers, like ranged, tanks, bosses etc.
        // Potentially on rounds % 5 we can summon boss type

        let max_enemies: usize = round * MAX_ENEMY_COUNT_MULTIPLE;
        let mut enemy_count: usize = (self.seed_state as usize) % max_enemies;

        if enemy_count == 0 { enemy_count = 1 } // min 1

        let mut enemies: Vec<Enemy> = vec![];

        for _ in 0..enemy_count {
            self.mutate_seed();
            let mut enemy = Enemy::new();

            let rand_empty_position = self.rand_empty_position();

            enemy.x = rand_empty_position.0;
            enemy.y = rand_empty_position.1;

            enemy.set_rand_value("health", self.seed_state, round);
            self.mutate_seed();
            enemy.set_rand_value("speed", self.seed_state, round);
            enemies.push(enemy)
        }

        enemies
    }

    fn render(&self) {
        for row in self.cells { // .iter().rev()
            let mut row_contents: String = String::new();

            for cell in row {
                match cell {
                    CellState::Blank => row_contents += "|   ",
                    CellState::Rock => row_contents += "| R ",
                    CellState::Tree => row_contents += "| T ",
                    CellState::Water => row_contents += "| W ",
                }
            }

            row_contents += "|";
            println!("{row_contents}");
        }
    }

    fn cells_to_string(&self) -> String {
        let mut result: String = "[".to_string();

        for row in self.cells {
            
            let mut row_str: String = "[".to_string();
            
            for cell in row {
                let cell_string: &str = cell.as_string();
                row_str += "\"";
                row_str += cell_string;
                row_str += "\", ";
            }

            // remove the last two chars, (, )
            row_str.pop();
            row_str.pop();

            result += &row_str;
            result += "], ";
        }

        // remove the last two chars, (, )
        result.pop();
        result.pop();

        result += "]";
        result
    }

    pub fn json(&self) -> String {
        let cells_string = self.cells_to_string();
        let seed_state = self.seed_state;
        let seed_state = format!("{seed_state}");

        let json_contents = format!("\"cells\": {cells_string}, \"initial_seed\": {SEED}, \"seed_state\": {seed_state}");

        let mut results: String = "{".to_string();
        results += json_contents.as_str();
        results += "}";
        results.to_string()
    }
}

pub fn run(seed: u32) -> Map {
    let mut map = Map::new();
    map.seed_state = seed;
    map.generate_tiles();

    map
}

pub fn get_round_data_json(enemies: Vec<Enemy>, seed: u32, seed_state: u32) -> String {
    let mut result: String = String::new();

    result += "{";
    result += "\"enemies\": [";

    for enemy in enemies {
        let ejsonstr = enemy.json();
        let ejson: &str = ejsonstr.as_str();
        result += ejson;
        result += ", ";
    }

    result.pop();
    result.pop();
    // remove the last two chars, (, )

    result += "], ";
    result += format!("\"seed\": {seed}, \"seed_state\": {seed_state}").as_str();
    result += "}";
    result
}

pub fn get_enemies_by_round(seed: u32, seed_state: u32, round: usize) -> (Vec<Enemy>, u32) {
    let mut map = Map::new();
    map.seed_state = seed;
    map.generate_tiles();

    map.seed_state = seed_state;
    let enemies = map.generate_enemies(round);
    (enemies, map.seed_state)
}