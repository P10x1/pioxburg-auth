const express = require("express");
const session = require("express-session");
const speakeasy = require("speakeasy");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
app.use(express.json());

app.use(cors({
  origin: "*",
  credentials: true
}));

app.use(session({
  secret: "PIOXBURG_SECRET",
  resave: false,
  saveUninitialized: false
}));

const users = {
  pioxi: {
    login: "prezydent",
    password: bcrypt.hashSync("haslo123", 10),
    twofa: "JBSWY3DPEHPK3PXP"
  }
};

app.post("/login", async (req, res) => {
  const { nick, login, password, token } = req.body;
  const user = users[nick];

  if (!user || user.login !== login)
    return res.status(401).end();

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).end();

  const verified = speakeasy.totp.verify({
    secret: user.twofa,
    encoding: "base32",
    token
  });

  if (!verified) return res.status(401).end();

  req.session.user = nick;
  res.json({ ok: true });
});

app.get("/me", (req, res) => {
  if (!req.session.user) return res.status(401).end();
  res.json({ user: req.session.user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("OK"));
