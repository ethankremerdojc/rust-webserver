use std::{
    fs,
    thread,
    time::Duration,
    path::Path
};


pub fn get_request_parameters(request_line: String) -> (String, String) {
    let split_contents: Vec<&str> = request_line.split(" ").collect::<Vec<_>>();
    let request_type: String = String::from(split_contents[0]);
    let uri: String = String::from(split_contents[1]);
    
    (request_type, uri)
}

pub fn get_response(request_type: &str, uri: &str) -> String {
    let mut status_line: String;
    let mut template_name: String;

    if uri == "/" {
        (status_line, template_name) = home_page(request_type)
    } else if uri == "/sleep" {
        (status_line, template_name) = sleep_page(request_type)
    } else if uri.starts_with("/static/") {
        (status_line, template_name) = static_file(request_type, uri)
    } else {
        (status_line, template_name) = four_oh_four(request_type)
    }

    let contents_result = fs::read_to_string(template_name);
    let contents;

    match contents_result {
        Ok(file) => contents = file,
        Err(error) => {
            (status_line, template_name) = four_oh_four(request_type);
            contents = fs::read_to_string(template_name).unwrap();
            println!("{error:?}");
            println!("{uri:?}");
        }
    }

    let length: usize = contents.len();
    format!("{status_line}\r\nContent-Length: {length}\r\n\r\n{contents}")
}

fn home_page(request_type: &str) -> (String, String) {
    let status_line: String = "HTTP/1.1 200 OK".to_string();
    let template_name: String = "html/index.html".to_string();

    (status_line, template_name)
}

fn sleep_page(request_type: &str) -> (String, String) {
    thread::sleep(Duration::from_secs(5));
    let status_line: String = "HTTP/1.1 200 OK".to_string();
    let template_name: String = "html/sleep.html".to_string();

    (status_line, template_name)
}

fn four_oh_four(request_type: &str) -> (String, String) {
    let status_line: String = "HTTP/1.1 404 NOT FOUND".to_string();
    let template_name: String = "html/404.html".to_string();

    (status_line, template_name)
}

fn static_file(request_type: &str, uri: &str) -> (String, String) {
    // Check that this file exists, otherwise return 404

    println!("Checking if file exists for {uri:?}");

    let len: usize = uri.len();
    let path_to_check = &uri[1..len];
    let file_exists: bool = Path::new(path_to_check).exists();

    println!("File exists: {file_exists:?}");

    if file_exists {
        let status_line: String = "HTTP/1.1 200 OK".to_string();
        (status_line, path_to_check.to_string())
    } else {
        four_oh_four(request_type)
    }
}