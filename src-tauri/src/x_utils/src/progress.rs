use std::collections::HashMap;
use std::sync::RwLock;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Status {
    percentage: f32,
    step_name: String,
}

impl Status {
    pub fn new() -> Self {
        return Status {
            percentage: 0.0,
            step_name: "".to_string(),
        };
    }

    pub fn set_percentage(&mut self, percentage: f32) {
        self.percentage = percentage;
    }

    pub fn set_step_name(&mut self, step_name: String) {
        self.step_name = step_name;
    }
}

pub type I18nDictGlobal = HashMap<String, Status>;

lazy_static! {
    #[derive(Debug)]
    static ref STATUS_LOCK: RwLock<I18nDictGlobal> = RwLock::new({
        let map = HashMap::new();
        map
    });
}

pub fn insert(key: &str, value: Status) {
    let mut gpw = STATUS_LOCK.write().unwrap();
    gpw.insert(key.to_string(), value);
}

pub fn insert_new(key: &str) {
    insert(key, Status::new())
}

pub fn get(key: &str) -> Status {
    let gpr = STATUS_LOCK.read().unwrap();
    let mut res = Status::new();

    match gpr.get(&key.to_string()) {
        Some(r) => {
            let st = &*r;
            res.percentage = st.percentage;
            res.step_name = String::from(&st.step_name);
        }
        None => {}
    }

    return res;
}

pub fn set(key: &str, percentage: f32, step_name: &str) -> bool {
    let mut gpw = STATUS_LOCK.write().unwrap();

    match gpw.get_mut(key) {
        Some(x) => {
            x.percentage = percentage;
            x.step_name = step_name.to_string();

            return true;
        }
        None => {
            return false;
        }
    }
}

pub fn delete(key: &str) {
    let mut gpw = STATUS_LOCK.write().unwrap();

    if gpw.contains_key(key) {
        gpw.remove(&key.to_string());
    }
}
