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
 *     summary: Create a new game and a game participant with the role 'Creator'
 *     tags: [Games]
 *     description: Creates a new game and automatically assigns the creating user as a game participant with the role 'Creator'. Returns the created game details.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user creating the game and to be assigned as the game's creator.
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
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Profile image for the game. The image is uploaded as a file.
 *     responses:
 *       200:
 *         description: Game and creator participant created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Game and creator participant created
 *                 gameId:
 *                   type: string
 *                   description: The ID of the newly created game.
 *       500:
 *         description: Error creating the game or participant
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

    const gameCreator = await prisma.gameParticipant.create({
      data: {
        userId: userId,
        gameId: newGame.id,
        role: "Creator",
        isAccepted: true,
      },
    });

    res.json("Game and participant created");
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

/**
 * @swagger
 * /games/acceptPlayer:
 *   put:
 *     summary: Accept a player in a game
 *     tags: [Games]
 *     description: Accepts a player's request to join a game.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - gameId
 *               - userId
 *             properties:
 *               gameId:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       302:
 *         description: Redirects to the game page.
 *       500:
 *         description: Error updating player status.
 */

router.post("/acceptPlayer/:gameId/:userId", async (req, res) => {
  const { gameId, userId } = req.params;

  try {
    await prisma.gameParticipant.updateMany({
      where: {
        gameId: gameId,
        userId: userId,
        isAccepted: false,
      },
      data: {
        isAccepted: true,
      },
    });

    res.json("Player accepted");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error updating player status");
  }
});

module.exports = router;
