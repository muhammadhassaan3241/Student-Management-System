const express = require("express");
const path = require("path");
const app = express();
const port = 3000;
const mysql = require("mysql");
const bodyParser = require("body-parser");

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "my_db",
});

con.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});

app.use("/css", express.static(path.resolve(__dirname, "public/css")));

// Configurations

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.urlencoded());
app.use(express.json());

app.set("view engine", "hbs");
app.set("views", "./views");

app.listen(port, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(port);
  }
});

// Routes
app.get("/loader", (req, res) => {
  res.render("loader");
});

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/add", (req, res) => {
  res.render("add");
});

app.get("/search", (req, res) => {
  res.render("search");
});

app.get("/update", (req, res) => {
  res.render("update");
});

app.get("/delete", (req, res) => {
  res.render("delete");
});

app.get("/addStudent", (req, res) => {
  // fetch data from form
  const { name, contact, email, gender } = req.query;

  // Sanitization XSS
  let check = "select * from users where email = ? or contact = ?";
  // res.send(req.query)
  con.query(check, [email, contact], (err, result) => {
    if (err) {
      throw err;
    } else {
      if (result.length > 0) {
        res.render("add", { checkMessage: true });
      } else {
        // Insert Query
        let insert = "INSERT into users values(?,?,?,?,1)";
        con.query(insert, [name, contact, email, gender], (err, results) => {
          if (results.affectedRows > 0) {
            res.render("add", { message: true });
          }
        });
      }
    }
  });
});

app.get("/searchStudent", (req, res) => {
  //    res.send(req.body)
  const { name } = req.query;
  let search =
    "select * from users where email = ? or contact = ? or name = ? ";
  con.query(search, [name, name, name], (err, data) => {
    if (err) throw err;
    else {
      if (data.length > 0) {
        res.render("search", { message1: true, message2: false });
      } else {
        res.render("search", { message1: false, message2: true });
      }
    }
  });
});

app.get("/updatesearch", (req, res) => {
  const { email } = req.query;
  let search = "select * from users where email = ?";
  con.query(search, [email], (err, data) => {
    if (err) throw err;
    else {
      if (data.length > 0) {
        res.render("update", { message1: true, message2: false, data: data });
      } else {
        res.render("update", { message1: false, message2: true });
      }
    }
  });
});

app.get("/updateStudent", (req, res) => {
  const { email, name, gender } = req.query;
  let update = "update users set name=?, gender=? where email=?";
  con.query(update, [name, gender, email], (err, data) => {
    if (err) {
      throw err;
    } else {
      if (data.affectedRows > 0) {
        res.render("update", { message1: true });
      }
    }
  });
});

app.get("/deleteStudent", (req, res) => {
  const { email } = req.query;
  // let search = "delete from users where email = ? "
  let update = "update users set status = 0 where email = ?";

  con.query(update, [email], (err, data) => {
    if (err) throw err;
    else {
      if (data.affectedRows > 0) {
        res.render("delete", { message1: true, message2: false });
      } else {
        res.render("delete", { message1: false, message2: true });
      }
    }
  });
});

app.get("/view", (req, res) => {
  let view = "select * from users";
  // res.send(req.query)
  con.query(view, (err, result) => {
    if (err) {
      throw err;
    } else {
      // console.log(result[0]);

      const Users = [...result];
      const temp = [];

      Users.map((user) => {
        if (user.status === 1) temp.push(user);
      });

      console.log(temp);

      res.render("view", { data: temp });
    }
  });
});
