use rust_webserver::ThreadPool;
use urls::get_response;


use std::{
    io::{prelude::*, BufReader},
    net::{TcpListener, TcpStream},
};

mod urls;
mod game;


fn main() {
    let listener: TcpListener = TcpListener::bind("0.0.0.0:7878").unwrap(); // This unwrap is fine, as only happens at beginning
    let pool: ThreadPool = ThreadPool::new(4);

    for stream in listener.incoming() {
        let stream = stream;

        match stream {
            Ok(stream) => {
                pool.execute(|| {
                    handle_connection(stream);
                });
            },
            Err(error) => {
                println!("Error: {error:?}");
            }
        }
    }
}

fn handle_connection(mut stream: TcpStream) {
    let buf_reader: BufReader<&mut TcpStream> = BufReader::new(&mut stream);

    let first_line_result = match buf_reader.lines().next() {
        Some(result) => { result },
        None => { 
            println!("Nothing found.");
            return 
        }
    };
    
    let request_line = match first_line_result {
        Ok(result) => { result },
        Err(error) => { 
            println!("error getting result line: {error}"); 
            return 
        }
    };

    let (request_type, uri) = urls::get_request_parameters(request_line);
    let (status_line, content_type, contents) = get_response(&request_type, &uri);

    let response = format!(
        "{}\r\nContent-Length: {}\r\n\r\n",
        status_line,
        contents.len()
    );

    stream.write(response.as_bytes()).unwrap();
    stream.write(&contents).unwrap();
    // match stream.write_all(response.as_bytes()) {
    //     Err(error) => println!("Problem writing response: {error:?}"),
    //     _ => { println!("ok") },
    // };
}