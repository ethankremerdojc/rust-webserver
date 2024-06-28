use std::{
    fs,
    thread,
    time::Duration,
    path::Path
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

    if uri == "/api/map_generation" {
        map_generation()
    } else if uri == "/api/round_details" {
        // round_details()
        todo!()
    } else {
        // broken
        todo!()
    }
}

fn map_generation() -> (String, String, Vec<u8>) {
    let status_line: String = "HTTP/1.1 200 OK".to_string();

    let base_case = game::base_case();
    let map_json = base_case.json();
    
    (status_line, "application/json".to_string(), map_json.as_bytes().to_vec())
}