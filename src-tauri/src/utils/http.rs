use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use serde_json::Value;
use tauri::api::http::{ClientBuilder, HttpRequestBuilder, ResponseType};

type StringMap = HashMap<String, String>;

#[derive(Serialize, Deserialize, Debug)]
pub struct HttpResponse {
    headers: StringMap,
    status: u16,
    data: Value,
}

impl HttpResponse {
    pub fn new() -> Self {
        HttpResponse {
            headers: StringMap::new(),
            status: 0,
            data: serde_json::Value::String("".to_string()),
        }
    }
}

// resp_data_type could be "text" / " json" / "binary"
pub async fn request(method: &str, url: &str, resp_data_type: &str) -> HttpResponse {
    let mut res = HttpResponse::new();
    let client = ClientBuilder::new().max_redirections(3).build().unwrap();
    let mut request = HttpRequestBuilder::new(method, url).unwrap();

    if resp_data_type == "text" {
        request = request.response_type(ResponseType::Text);
    } else if resp_data_type == "json" {
        request = request.response_type(ResponseType::Json);
    } else if resp_data_type == "binary" {
        request = request.response_type(ResponseType::Binary);
    } else {
        println!("resp_data_type error: {:?}", resp_data_type);
    }

    if let Ok(response) = client.send(request).await {
        println!(">>> got response {:?}", &response);

        let resp = response.read().await;
        let resp_data = match resp {
            Ok(o) => o,
            Err(e) => {
                println!("read response error: {:?}", e);
                return res;
            }
        };
        println!(">>> got response read {:?}", &resp_data);

        // Add header
        for item in resp_data.headers {
            let (k, v) = item;
            res.headers.insert(k, v);
        }

        res.status = resp_data.status;
        res.data = resp_data.data;
    } else {
        println!("Something Happened!");
    }

    res
}
