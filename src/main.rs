use rust_webserver::ThreadPool;
use urls::get_response;


use std::{
    io::{prelude::*, BufReader},
    net::{TcpListener, TcpStream},
};

mod urls;
mod game;


fn main() {

    game::base_case();

    // let listener: TcpListener = TcpListener::bind("0.0.0.0:7878").unwrap();
    // let pool: ThreadPool = ThreadPool::new(4);

    // for stream in listener.incoming() {
    //     let stream: TcpStream = stream.unwrap();

    //     pool.execute(|| {
    //         handle_connection(stream);
    //     });
    // }
}

fn handle_connection(mut stream: TcpStream) {
    let buf_reader: BufReader<&mut TcpStream> = BufReader::new(&mut stream);
    let request_line: String = buf_reader.lines().next().unwrap().unwrap(); //todo should handle this
    let (request_type, uri) = urls::get_request_parameters(request_line);
    let response: String = get_response(&request_type, &uri);

    stream.write_all(response.as_bytes()).unwrap(); //todo should handle this lol
}