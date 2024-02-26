const express = require("express");
const app = express();
const port = 3000;
const morgan = require('morgan');
const cors = require('cors');
const admin = require('firebase-admin');

const serviceAccount = require("./config/firebase-service-account-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const whitelist = ['http://localhost:5173'];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", require("./routes"));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
