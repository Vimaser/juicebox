# Project Description

JuiceBox 

What are we building?

Nothing less than a Back-End-Only project. We are going to make a "Simple" Tumblr clone. I use quotes around simple because it will be anything but simple for to implement.

We will be designing a back-end which has both a Database layer as well as (later) a web server with a custom API, and testing it by curl ing against the endpoints we create.

This project is probably the hardest, since it involves two totally new technologies, so it is written more as a tutorial, with fewer open ends.

Additionally, each day has a starting code from the day before. Use this knowledge carefully, and try not to rely on the starting code too much, since it has the potential to jump you ahead of your current understanding of the materials.

Also, there's not a great preview for this part of the project, so a screenshot is being omitted at this time.

# What Will We Need to Know?

SQL
    How to connect to PostgreSQL from the command line
    Basic PostgreSQL commands like \c, \d
    The basics of creating/dropping an entire database
    The basics of creating/dropping a table
    Basic data types
    What a primary key is
    What a foreign key is
    How to insert data into a database
    How to retrieve data from a database
    How to update data in a database
    How to join related tables into one mega-table

NODE
    How to connect to a database using pg
    How to separate our concerns and organize our code
    How to export/import functionality from one file to another

# Success Metrics

HOW DO I KNOW I'M DONE?

    You will be done once you've writte every line of code from this workshop, and pushed it it to your GitHub remote.

    By the end of this part of the project there won't be much for us to look at or share, that will come first at the end of Part 2 (the API)


# Juicebox Part II

- Prework

# JWT

Used for authorize, not authentication. Makes sure same user. Uses session. Uses JSON web token.

# Setting upoo a basic server using express

NPM install express
package.json

to use express we require it.

```JavaScript

const express = require('express');

const server = express();

server.listen(5000, () ={
    console.log("Servers is up!");
});

//attaching a general route

server.get('/hello', function (req, res, next) {
    console.log('Hello World!');
    console.log(req);
    console.log(res);
    console.log(next);
});

console.log(express);

// testing with curl
curl http://localhost:5000/hello
```

Package.json
"server:dev": "nodemon index.js",
"server:prod": "node index.js"

NPM run server:dev

# Subroutes with express router

```JavaScript

const express = require('express');
const server = express();

/* server.get('/hello', function (req, res, next){
    res.send("hello there");
}); */

server.use('/app', require('./routes/index.js'))

server.listem(5000, () => {
    console.log("Server is up!");
});

// Routers
```

mkdir routes or api
cd route / api
touch index.js

```JavaScript
// create router
const appRouter = require('express').Router();

appRouter.use((req, res, next) => {
    console.log(req.url);

    next();
});

appRouter.get('/', (req, res, next) => {
    res.send({
        message: 'welcome to my app.'
    });
});

appRouter.post('/sayHello', (req, res, next) => {
    res.send({
        message: 'thanks for sending the data!'
    });
});

// -X POST

// export router
module.exports = appRouter;

```

# BodyParser and Advnaced Curl


```JavaScript

const express = require('express');
const server = express();

const bodyParser = require('body-parser');

server.use(bodyParser.json());

server.use((req, res, next) => {
    console.log("Body is now", req.body);
    next();
});

const  appRouter = require('./routes');
server.use('/app', appRouter);

server.listen(5000, () => {
    console.log("Server is up!");
});

```

//testing curl

-H "Content-Type: application/json"

-d '{"key":"value"}'


# JSON WEB TOKENS

```JavaScript

const express = require('express');
const server = express();

const bodyParser = require('body-parser');

server.use(bodyParser.json());

server.use((req, res, next) => {
    console.log("Body is now", req.body);
    next();
});

const  appRouter = require('./routes');
server.use('/app', appRouter);

server.listen(5000, () => {
    console.log("Server is up!");
});

// jsonwebtoken package
```

go up a level

mkdir jwt
touch index.js

```JavaScript
const jwt = require('jsonwebtoke');

const SECRET_INGREDIENT = "krabby patty";

function encodeData (data) {
    const encoded = jwt.sign(
        data.
        SECRET_INGREDIENT.
    );

    return encoded;
}

function decodeData(encodedData) {
    const data = jwt.verify(
        encodedData,
        SECRET_INGREDIENT
    );

    return data;
}

module.export = {
    encodedData,
    decodedData
}
```

CMD line

const { encodedData, decodedData } = require('./jwt')

encodedData('original message')

decodeData('hashstring')