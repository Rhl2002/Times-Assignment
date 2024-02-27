const http = require('http');
const https = require('https');
const { parse } = require('url');

// Function to make HTTP GET request
function fetchHTML(url, callback) {
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('end', () => {
            callback(data);
        });
    }).on("error", (error) => {
        console.error("Error fetching data:", error.message);
    });
}

// Function to extract latest stories from HTML content
function extractStories(htmlContent) {
    const stories = [];
const liRegex = /<li class="latest-stories__item">.*?<\/li>/gs;
    let matches;

    while ((matches = liRegex.exec(htmlContent)) !== null) {
        const listItemContent = matches[0];
        
        
        const linkMatch = /<a.*?href="(.*?)"/.exec(listItemContent);
        const titleMatch = /<h3 class="latest-stories__item-headline">(.*?)<\/h3>/.exec(listItemContent);

        if (linkMatch && titleMatch) {
            const link ="https://time.com"+ linkMatch[1];
            const title = titleMatch[1].trim(); 
            stories.push({ title, link });
        }
    }

    return stories;
}

//  HTTP server 
const server = http.createServer((req, res) => {
    const { pathname } = parse(req.url);

    if (pathname === '/getTimeStories' && req.method === 'GET') {
        const url = 'https://time.com';

        fetchHTML(url, (htmlContent) => {
            const latestStories = extractStories(htmlContent);
            const responseData = JSON.stringify(latestStories, null, 2);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(responseData);
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// Start the server
const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
