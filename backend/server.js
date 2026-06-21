require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const client = require('../config/pgconfict');


// removes mongo db and importes pg client //

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// nodemailer setup //
const emailUser = process.env.Email_User || 'pranavsoma2912@gmail.com';
const emailPass = process.env.Email_Password;

if (!emailPass) {
  console.error('Missing SMTP password: set Email_Password in your .env or environment variables.');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP Error:", error);
  } else {
    console.log("SMTP Ready");
  }
});

// Serve static files
app.use(express.static('static'));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// EJS setup
app.set('view engine', 'ejs');
app.set('views', './backend/templates');

// LOGIN PAGE
app.get("/login", (req, res) => {
  res.render("login");
});

// SIGNUP PAGE
app.get("/signup", (req, res) => {
  res.render("signup");
});


// LOGIN ROUTE
app.post('/login', async (req, res) => {

  const { email, password } = req.body;

  try {

    const result = await client.query(
      'SELECT * FROM userstable WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.send("Invalid email or password");
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.send("Invalid email or password");
    }

    req.session.user = user;

    await transporter.sendMail({
      from: 'emailUser',
      to: user.email,
      subject: 'Login Successful',
      html: `
    <div style="font-family: Arial; padding:20px;">
      <h2>Hello ${user.email.split('@')[0]} 👋</h2>
      <p>Your account was logged in successfully.</p>
      <p>If this wasn't you, please secure your account immediately.</p>
    </div>
  `
    });

    res.redirect("/home");

  } catch (error) {

    console.log(error);
    res.status(500).send("Server error");

  }

});


// SIGNUP ROUTE
app.post('/signup', async (req, res) => {

  const { email, password } = req.body;

  try {

    const existingUser = await client.query(
      'SELECT * FROM userstable WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await client.query(
      'INSERT INTO userstable (email, password) VALUES ($1, $2)',
      [email, hashedPassword]
    );

    res.redirect("/login");

  } catch (error) {

    console.log(error);
    res.status(500).send("Server error");

  }

});


// LOGOUT
app.get('/logout', (req, res) => {

  req.session.destroy(() => {
    res.redirect("/login");
  });

});

// Helper function to get auth data
const getAuthData = (req) => {
  if (req.session.user) {
    return {
      username: req.session.user.email.split('@')[0],
      isLoggedIn: true
    };
  } else {
    return {
      username: null,
      isLoggedIn: false
    };
  }
};

// HOME PAGE (with authentication)
app.get("/home", (req, res) => {
  const authData = getAuthData(req);
  if (authData.isLoggedIn) {
    res.render("home", authData);
  } else {
    res.redirect("/login");
  }
});

// ROOT PAGE
app.get("/", (req, res) => {
  const authData = getAuthData(req);
  res.render("home", authData);
});

app.get("/customize_upload", (req, res) => {
  const authData = getAuthData(req);
  res.render("customize_upload", authData);
});

app.get("/choose_model", (req, res) => {
  const authData = getAuthData(req);
  res.render("choose_model", authData);
});

app.get("/customize_chatbot", (req, res) => {
  const authData = getAuthData(req);
  res.render("customize_chatbot", authData);
});

app.get("/bot_builder", (req, res) => {
  const authData = getAuthData(req);
  res.render("bot_builder", authData);
});

app.get("/templates", (req, res) => {
  const authData = getAuthData(req);
  res.render("templates", authData);
});

app.get("/my_bots", (req, res) => {
  const authData = getAuthData(req);
  res.render("my_bots", authData);
});

app.get("/assignments", (req, res) => {
  const authData = getAuthData(req);
  res.render("assignments", authData);
});

app.get("/assignment/:id", (req, res) => {
  const authData = getAuthData(req);
  res.render("assignment_detail", {
    assignment_id: req.params.id,
    ...authData
  });
});

// SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});