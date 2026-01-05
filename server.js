const express = require("express");
const session = require("express-session");
const speakeasy = require("speakeasy");
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

/* 👤 BAZA UŻYTKOWNIKÓW */
const users = {
  pioxi_minecraft: {
    login: "P180911",
    twofa: "JBSWY3DPEHPK3PXP"  // 16 znaków, poprawne Base32
  },
  sokowypanek: {
    login: "F230411",
    twofa: "KZXW6YTBOIYQ2L6P"  // rozszerzony do 16 znaków Base32
  },
  BurgerJami: {
    login: "N181011",
    twofa: "MFRGGZDFMZTWQ2LK"  // już było poprawne
  },
  KATIKOT111: {
    login: "A101111",
    twofa: "NB2CFEJSOQW2R7LX"  // zmieniony, 16 znaków Base32, bez kropki
  },
  Juliksonxd: {
    login: "J181211",
    twofa: "ONSWG4TFOQXW2L7K"  // rozszerzony do 16 znaków Base32
  },
  anyanax: {
    login: "Z281211",
    twofa: "KRUGS4TFOIYQ2L6N"  // rozszerzony do 16 znaków Base32
  }
};


/* 🔐 LOGOWANIE */
app.post("/login", (req, res) => {
  const { nick, login, token } = req.body;
  const user = users[nick];

  if (!user || user.login !== login) {
    return res.status(401).json({ error: "BAD_LOGIN" });
  }

  const verified = speakeasy.totp.verify({
    secret: user.twofa,
    encoding: "base32",
    token,
    window: 1
  });

  if (!verified) {
    return res.status(401).json({ error: "BAD_2FA" });
  }

  req.session.user = nick;
  res.json({ ok: true });
});

/* 👤 SPRAWDZENIE SESJI */
app.get("/me", (req, res) => {
  if (!req.session.user) return res.status(401).end();
  res.json({ user: req.session.user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("OK – Pioxburg Auth działa"));
