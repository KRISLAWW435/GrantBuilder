import https from 'https';

https.get("https://raw.githubusercontent.com/KRISLAWW435/Grant/main/assets/%D1%81%D0%BB%D0%B0%D0%B9%D0%B4%D1%8B/slide-1.webp", (res) => {
  console.log("Status:", res.statusCode);
  console.log("Headers:", res.headers);
});
