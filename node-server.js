const http = require('http');

const server = http.createServer((request, response) => {
    // console.log('header',request.header);
    console.log('method',request.method);
    console.log('url',request.url);
    response.setHeader('content-type', 'text/html');
    response.end('<h1> Hey,there......</h1>')
})


server.listen(3000);