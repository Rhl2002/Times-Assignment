const http = require("http");
const https = require("https");
const { parse } = require("url");

// Function to make HTTP GET request
function fetchHTML(url, callback) {
  const protocol =  https;

  protocol
    .get(url, (response) => {
      let data = "";
      response.on("data", (chunk) => {
        data += chunk;
      });
      response.on("end", () => {
        callback(data);
      });
    })
    .on("error", (error) => {
      console.error("Error fetching data:", error.message);
    });
}
let ans = [];
function myfun(str) {
  let start = str.indexOf("<a");
  let end = str.indexOf(">", start);
  let link = str.substring(start + 9, end - 1);
  link = "https://time.com" + link;
  start = str.indexOf("headline");
  end = str.indexOf("</h3>", start);
  let title = str.substring(start + 10, end);

  ans.push({ title, link });
  // console.log("title:",title, "link",link);
}

// Function to extract latest stories from HTML content
function extractStories(htmlContent) {
  // console.log(htmlContent)
  let count = 6,
    startIndex = 0,
    endIndex = 0;
  while (count--) {
    startIndex = htmlContent.indexOf(
      '<li class="latest-stories__item">',
      startIndex
    );
    endIndex = htmlContent.indexOf("</li>", startIndex);
    let str = htmlContent.substring(startIndex, endIndex);
    // console.log(str);
    myfun(str, htmlContent);
    startIndex = endIndex + 1;
  }
//   console.log(ans);
  return ans;
}

//  HTTP server
const server = http.createServer((req, res) => {
  const { pathname } = parse(req.url);

  if (pathname === "/getTimeStories" && req.method === "GET") {
    const url = "https://time.com";

    fetchHTML(url, (htmlContent) => {
      // res.end(htmlContent)
      const latestStories = extractStories(htmlContent);
      const responseData = JSON.stringify(latestStories, null, 2);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(responseData);
    });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

// Start the server
const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
