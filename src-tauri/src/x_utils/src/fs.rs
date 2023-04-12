use std::fs;

use crate::errors::EaError as x_error;
use crate::logger as x_logger;

// Rename a file or directory to a new name
pub fn rename(path_old: &str, path_new: &str) -> bool {
    match fs::rename(path_old, path_new) {
        Ok(_) => return true,
        Err(e) => {
            let eee = x_error::ReNameError {
                old_path: path_old.to_owned(),
                new_path: path_new.to_owned(),
                error: e,
            };
            x_logger::log_error(&format!("rename:: {}\n", eee));
            return false;
        }
    }
}
