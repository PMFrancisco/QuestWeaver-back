const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

const upload = require("../config/multer");
const handleUpload = require("../middlewares/handleUpload");

/**
 * @swagger
 * tags:
 *   name: Games
 */

/**
 * @swagger
 * /games:
 *   get:
 *     summary: List all games
 *     tags: [Games]
 *     description: Retrieves and renders a list of all games.
 *     responses:
 *       200:
 *         description: Games list page rendered.
 *       500:
 *         description: Error getting the games.
 */

router.get("/", async (req, res) => {
  try {
    const games = await prisma.game.findMany({
      include: {
        creator: true,
        participants: true,
      },
    });

    res.json(games);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error getting the games");
  }
});

/**
 * @swagger
 * /games/createGame/{userId}:
 *   post:
 *     summary: Create a new game
 *     tags: [Games]
 *     description: Creates a new game and redirects to the game page.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user creating the game.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the game.
 *               description:
 *                 type: string
 *                 description: Description of the game.
 *     responses:
 *       200:
 *         description: Game created successfully.
 *       500:
 *         description: Internal Server Error.
 */

router.post("/createGame/:userId",
upload.single("profileImage"),
async (req, res) => {
  try {
    const userId = req.params.userId;
    const { name, description } = req.body;

    let gameImageUrl = undefined

    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const cldRes = await handleUpload(dataURI);
      gameImageUrl = cldRes.secure_url;
    }

    const newGame = await prisma.game.create({
      data: {
        name: name,
        description: description,
        creatorId: userId,
        gameImage: gameImageUrl,
      },
    });

    res.json("Game created");
  } catch (error) {
    res.status(500).send("Error creating the game");
  }
});

/**
 * @swagger
 * /games/joinGame/{userId}/{gameId}:
 *   post:
 *     summary: Join a game
 *     tags: [Games]
 *     description: Joins a user to a game and sends an email notification to the game creator.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - gameId
 *             properties:
 *               gameId:
 *                 type: string
 *     responses:
 *       302:
 *         description: Redirects to the game page.
 *       500:
 *         description: Error joining the game.
 */

router.post("/joinGame/:userId/:gameId", async (req, res) => {
  const gameId = req.params.gameId;
  const userId = req.params.userId;

  try {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { creator: true },
    });

    await prisma.gameParticipant.create({
      data: {
        gameId: gameId,
        userId: userId,
        role: "Player",
        isAccepted: false,
      },
    });

/*     const gameUrl = `${req.protocol}://questweaver.onrender.com/games/${gameId}`;

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: game.creator.email,
      subject: `New player wants to join: ${game.name}`,
      html: `Hello ${game.creator.firstName},<br><br>${req.user.displayName} wants to join <a href="${gameUrl}">${game.name}</a>.`,
    };

    await transporter.sendMail(mailOptions); */

    res.json("Game joined");
  } catch (error) {
    res.status(500).send("Error joining the game");
  }
});

/**
 * @swagger
 * /games/{gameId}/{userId}:
 *   get:
 *     summary: View game
 *     tags: [Games]
 *     description: Renders the page for a specific game.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Game ID.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Game page rendered.
 *       500:
 *         description: Error getting the game.
 */

router.get("/:gameId/:userId", async (req, res) => {
  try {
    const gameId = req.params.gameId;

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    res.json(game)
  } catch (error) {
    res.status(500).send("Error getting the game");
  }
});

module.exports = router;
