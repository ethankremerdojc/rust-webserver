// set up all functions for reading and writing to database
//

/*
const SEED = 4991;
const MULTNUM = 2912;
const POW = 4;
const MODNUM = 9999;

let gennum = SEED;

console.log(gennum);

for (i=0; i < 10; i++) {
    gennum = (Math.pow(gennum, POW) * MULTNUM) % MODNUM;
    console.log(gennum);
}
*/

// PROCEDURALLY GENERATED ROWS

const MAP_HEIGHT: usize = 20;
const MAP_WIDTH: usize = 20;

const SEED: u32 = 57; // 38
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

#[derive(Debug)]
struct Map {
    cells: [[CellState; MAP_HEIGHT]; MAP_WIDTH],
    seed_state: u32 // set default to SEED
}

impl Map {
    fn new() -> Map {
        Map {
            cells: [[CellState::Blank; MAP_HEIGHT]; MAP_WIDTH],
            seed_state: SEED
        }
    }

    fn get_total_cell_count(&self) -> usize {
        MAP_HEIGHT * MAP_WIDTH
    }

    fn mutate_seed(&mut self) {
        self.seed_state = ((self.seed_state + ADD_NUM) * MULT_NUM) % MAX_SEED_SIZE;
        let seed_state = self.seed_state;
        println!("{seed_state}");
    }

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
                let height: u32 = MAP_HEIGHT as u32;
                let width: u32 = MAP_WIDTH as u32;
                
                self.mutate_seed();
                let xpos: usize = (self.seed_state % width) as usize;
                self.mutate_seed();
                let ypos: usize = (self.seed_state % height) as usize;
                
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
                let height: u32 = MAP_HEIGHT as u32;
                let width: u32 = MAP_WIDTH as u32;
                
                self.mutate_seed();
                let xpos: usize = (self.seed_state % width) as usize;
                self.mutate_seed();
                let ypos: usize = (self.seed_state % height) as usize;
                
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
        
    }



    fn render(&self) {
        for row in self.cells.iter().rev() {
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
}

pub fn base_case() {
    let mut map = Map::new();
    map.generate();
    map.render();
}