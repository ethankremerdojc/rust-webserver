use std::{
    fs, path::Path, thread, time::Duration, vec
};
use crate::game;

//TODO 1. Allow browser to send specified seed.
//TODO 2. Browser send the current game state and round number and current adjusted seed.
//TODO 3. Let enemies have multiple hitpoints

pub fn get_request_parameters(request_line: String) -> (String, String) {

    // Get post data

    let split_contents: Vec<&str> = request_line.split(" ").collect::<Vec<_>>();
    let request_type: String = String::from(split_contents[0]);
    let uri: String = String::from(split_contents[1]);
    
    (request_type, uri)
}

pub fn get_response(request_type: &str, uri: &str) -> (String, String, Vec<u8>) {
    let status_line: String;
    let template_name: String;

    if uri == "/" {
        (status_line, template_name) = home(request_type)
    } else if uri == "/sleep" {
        (status_line, template_name) = sleep(request_type)
    } else if uri == "/game" {
        (status_line, template_name) = game(request_type)
    } else if uri.starts_with("/static/") {
        (status_line, template_name) = static_file(request_type, uri)
    } else if uri.starts_with("/api/") {
        return api_response(request_type, uri)
    } else {
        (status_line, template_name) = four_oh_four(request_type)
    }

    get_file_response(status_line, template_name, uri, request_type)
}

fn get_content_type(template_name_sub: &String) -> &str {
    // https://stackoverflow.com/questions/23714383/what-are-all-the-possible-values-for-http-content-type-header

    let content_type: &str;

    if template_name_sub.ends_with(".html") {
        content_type = "text/html";
    } else if template_name_sub.ends_with(".css") {
        content_type = "text/css"
    } else if template_name_sub.ends_with(".js") {
        content_type = "text/javascript"
    } else if template_name_sub.ends_with(".png") {
        content_type = "image/png"
    } else {
        content_type = "text/plain"
    }

    content_type
}

fn get_file_response(mut status_line: String, template_name: String, uri: &str, request_type: &str) -> (String, String, Vec<u8>) {
    let contents_result = fs::read(&template_name);
    let contents: Vec<u8>;

    let template_name_sub = &template_name;

    match contents_result {
        Ok(file) => contents = file,
        Err(error) => {
            (status_line, _) = four_oh_four(request_type);
            contents = fs::read(template_name_sub).unwrap();
            println!("{error:?}");
            println!("{uri:?}");
        }
    }

    let content_type = get_content_type(template_name_sub).to_string();

    (status_line, content_type, contents)
}

fn home(request_type: &str) -> (String, String) {
    let status_line: String = "HTTP/1.1 200 OK".to_string();
    let template_name: String = "html/index.html".to_string();

    (status_line, template_name)
}

fn sleep(request_type: &str) -> (String, String) {
    thread::sleep(Duration::from_secs(5));
    let status_line: String = "HTTP/1.1 200 OK".to_string();
    let template_name: String = "html/sleep.html".to_string();

    (status_line, template_name)
}

fn game(request_type: &str) -> (String, String) {
    let status_line: String = "HTTP/1.1 200 OK".to_string();
    let template_name: String = "html/game.html".to_string();

    (status_line, template_name)
}

fn four_oh_four(request_type: &str) -> (String, String) {
    let status_line: String = "HTTP/1.1 404 NOT FOUND".to_string();
    let template_name: String = "html/404.html".to_string();

    (status_line, template_name)
}

fn static_file(request_type: &str, uri: &str) -> (String, String) {
    let len: usize = uri.len();
    let path_to_check = &uri[1..len];
    let file_exists: bool = Path::new(path_to_check).exists();

    if file_exists {
        let status_line: String = "HTTP/1.1 200 OK".to_string();
        (status_line, path_to_check.to_string())
    } else {
        four_oh_four(request_type)
    }
}

fn api_response(request_type: &str, uri: &str) -> (String, String, Vec<u8>) {

    if uri.starts_with("/api/map_generation") {
        map_generation(uri)
    } else if uri == "/api/round_details" {
        // round_details()
        todo!()
    } else {
        // broken
        todo!()
    }
}

fn get_uri_query_data(uri: &str) -> Vec<(String, String)> {
    let qmark_index = match uri.find('?') {
        Some(value) => value,
        None => return vec!()
    };

    let query_data: &str = &uri[qmark_index + 1..];

    let query_strings_split = query_data.split("&");
    let query_strings: Vec<&str> = query_strings_split.collect();

    println!("{query_strings:?}");

    let mut result: Vec<(String, String)> = vec![];

    for query_string in query_strings {
        let q_split = query_string.split("=");
        let q_collected: Vec<&str> = q_split.collect();

        result.push((q_collected[0].to_string(), q_collected[1].to_string())); 
    }

    result
}

fn map_generation(uri: &str) -> (String, String, Vec<u8>) {
    let status_line: String = "HTTP/1.1 200 OK".to_string();
    let query_data: Vec<(String, String)> = get_uri_query_data(uri);
    
    // println!("Uri: {uri}");
    // println!("{query_data:?}");

    let mut seed: u32 = 0;
    let mut seed_state: u32 = 0;
    let mut round: usize = 0;

    for qd in query_data {
        if qd.0 == "seed" {
            seed = qd.1.parse::<u32>().unwrap();
        }
        if qd.0 == "seedState" {
            seed_state = qd.1.parse::<u32>().unwrap();
        }
        if qd.0 == "round" {
            round = qd.1.parse::<usize>().unwrap();
        }
    }

    println!("Seed: {seed}, Seed State: {seed_state}, Round: {round}");
    // Seed: 294, Seed State: 1992, Round: 4 

    // we will create a game with our initial seed (to initialize all the cells)
    // to be the same as what the user is seeing

    // then we set the seedstate to whatever the user has (will be different
    // based on what round they are on) Then generate some new enemies for them
    // based on the round number and seedstate.

    let map = game::run(seed, seed_state, round);
    let map_json: String = map.json();
    (status_line, "application/json".to_string(), map_json.as_bytes().to_vec())
}