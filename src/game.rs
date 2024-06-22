const MAP_WIDTH: usize = 20;
const MAP_HEIGHT: usize = 20;

const SEED: u32 = 98; // 38
const MAX_SEED_SIZE: u32 = 33391; //33391; // all 3 of below are primes
const MULT_NUM: u32 = 3803; //3803;
const ADD_NUM: u32 = 7499; //7499;

#[derive(Default, Debug, Clone, Copy)]
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

    fn generate(&mut self) {
        self.gen_rocks();
        self.gen_trees();
        self.gen_water_sources();
    }

    fn gen_rocks(&mut self) {
        let total_cell_count = self.get_total_cell_count();
        let max_rocks = total_cell_count / 5;

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
        let max_trees = total_cell_count / 2;
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
        // self.gen_rivers();
        self.gen_lakes();
    }

    fn gen_lakes(&mut self) {
        let total_cell_count = self.get_total_cell_count();
        let max_trees = total_cell_count / 12;

        for _ in 0..max_trees {

            self.mutate_seed();
            
            if self.seed_state % 4 == 0 {
                let (xp, yp) = self.rand_position();    
                let xpos: i32 = xp as i32;
                let ypos: i32 = yp as i32;
                
                let max_spread:usize = 6; // Each cell has 8 neighbors

                let mut positions: Vec<(usize, usize)> = Vec::new();

                positions.push((xp, yp));

                for _ in 0..max_spread {
                    self.mutate_seed();

                    // x and y can be + (-1), +0 +1
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
                    self.gen_lake(col, row);
                }
            }
        }
    }

    fn gen_lake(&mut self, col: usize, row: usize) {
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
        results
    }
}

pub fn base_case() -> Map {
    let mut map = Map::new();
    map.generate();
    map.render();
    map
}