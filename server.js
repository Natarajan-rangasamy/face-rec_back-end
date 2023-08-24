const express = require("express");
const cors = require("cors");
const knex = require('knex');


const pg = knex({
  client: 'pg',
  connection: {
    connectionString : process.env.DATABASE_URL,
    ssl: { rejectUnauthorized:false },
    host:process.env.DATABASE_HOST,
    port: 5432,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PW,
    database: process.env.DATABASE_DB
  }
});

// pg.select('*').from('users').then(data =>{
//   console.log(data);
// })


const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

const db = {
  users: [
    {
      id: "1",
      name: "sam",
      email: "sam@gmail.com",
      password: "kick",
      entries: 0,
      joined: new Date(),
    },
    {
      id: "2",
      name: "samins",
      email: "samins@gmail.com",
      password: "kock",
      entries: 0,
      joined: new Date(),
    },
  ],
};

// app.get("/", (req, res) => {
//   res.send(db.users);
// });

app.post("/signin", (req, res) => {

  const { email, password } = req.body;

    pg.select('email','password').from('login')
    .where('email', '=', email )
    .then( data => {
      if( password === data[0].password){
       return pg.select('*')
        .from('users')
        .where('email' , '=' , email)
        .then( user =>{
          res.json(user[0])
        })
        .catch(err => res.status(400).json("unable to grab user"))
      }
       else{
       res.status(400).json("Invalid  login Credentials")
      }
    })
    .catch(err => res.status(400).json('something wrong'))
  
  // if (
  //   req.body.email === db.users[0].email &&
  //   req.body.password === db.users[0].password
  // ) {
  //   res.json(db.users[0]);
  // } else {
  //   res.status(400).send("something went wrong");
  // }
});

app.post("/register", (req, res) => {
  const { email, password, name} = req.body;


  pg.transaction( trx => {
    trx.insert({
      email:email,
      password:password
    })
    .into('login')
    .returning('email')
    .then( loginEmail => {
      return trx('users')
      .returning('*')
      .insert({
        email:loginEmail[0].email,
        name:name,
        password:password,
        joined:new Date()
      })
      .then(user =>{
        res.json(user[0])
      })
      .then(trx.commit)
      .catch(trx.rollback)
    }).catch(err => res.status(400).json("User already exists"))
  })
});

app.get("/profile/:id", (req, res) => {
  const { id } = req.params;

  pg.select('*').from('users').where({ id })
  .then( user => {
    if(user.length){
      res.json(user[0])
    }
    else{
      res.status(400).json("User not exist")
    }
  }).catch(err => res.status(400).json("something went wrong..!"))

  // let found = false;
  // db.users.forEach((user) => {
  //   if (user.id === id) {
  //     found = true;
  //     return res.json(user);
  //   }
  // });
  // if (!found) {
  //   res.status(400).send("no such users found");
  // }
});

app.put("/image", (req, res) => {
  const { id } = req.body;

  pg('users').where('id', '=' ,id).increment('entries',1)
  .returning('entries').then( entries =>{
    res.json(entries[0].entries)
  }).catch(err => res.status(400).json('try again with new picture'))


  // let found = false;
  // db.users.forEach((user) => {
  //   if (user.id === id) {
  //     found = true;
  //     user.entries++;
  //     return res.json(user.entries);
  //   }
  // });
  // if (!found) {
  //   res.status(400).send("no such users found");
  // }
});

app.listen(3000);
