const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

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
 * /games/createGame:
 *   post:
 *     summary: Create a new game
 *     tags: [Games]
 *     description: Creates a new game and redirects to the game page.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       302:
 *         description: Redirects to the newly created game page.
 *       500:
 *         description: Error creating the game.
 */

router.post("/createGame/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const { name, description } = req.body;
    const newGame = await prisma.game.create({
      data: {
        name: name,
        description: description,
        creatorId: userId,
      },
    });

    res.json("Image updated");
  } catch (error) {
    console.log("🚀 ~ router.post ~ error:", error)
    res.status(500).send("Error creating the game");
  }
});

module.exports = router;
