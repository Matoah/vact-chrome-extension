export function toFileSize(size: number) {
  let kb = 1024;
  let mb = kb * 1024;
  let gb = mb * 1024;
  if (size >= gb) {
    let res = size / gb;
    return res.toFixed(2) + " GB";
  } else if (size >= mb) {
    let res = size / mb;
    return res.toFixed(2) + " MB";
  } else if (size >= kb) {
    let res = size / kb;
    return res.toFixed(2) + " KB";
  } else return size + " B";
}
