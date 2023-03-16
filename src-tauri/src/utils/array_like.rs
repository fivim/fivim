pub fn fill_arr_u8(input: &[u8], length: usize) -> Vec<u8> {
    let pwd_bytes = input.to_vec();
    let mut pwd_bytes_res: Vec<u8>;
    if pwd_bytes.len() < length {
        pwd_bytes_res = pwd_bytes;
        while pwd_bytes_res.len() < length {
            pwd_bytes_res.push(0);
        }
    } else if pwd_bytes.len() > length {
        pwd_bytes_res = pwd_bytes[0..length].to_vec();
    } else {
        pwd_bytes_res = pwd_bytes
    }

    return pwd_bytes_res;
}