const express = require("express");
const app = express();
const port = 3000;
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();

const http = require("http");
const socketIo = require("socket.io");
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_DOMAINS,
    methods: ["GET", "POST"],
  },
});

const whitelist = process.env.CORS_DOMAINS;
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("saveMap", async (data) => {
    try {
      await io.emit("mapUpdated", data);
    } catch (error) {
      console.error("Error processing map data:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.use(cors(corsOptions));
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", require("./routes"));

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
