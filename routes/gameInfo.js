const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

/**
 * @swagger
 * tags:
 *   name: GameInfo
 */

/**
 * @swagger
 * /gameInfo/{gameInfoId}:
 *   get:
 *     summary: Get a specific GameInfo
 *     tags: [GameInfo]
 *     description: Fetches a specific GameInfo entry by its ID.
 *     parameters:
 *       - in: path
 *         name: gameInfoId
 *         required: true
 *         description: The ID of the GameInfo to fetch.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A specific GameInfo entry.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: The GameInfo ID.
 *                 title:
 *                   type: string
 *                   description: The title of the GameInfo.
 *                 content:
 *                   type: string
 *                   description: The content of the GameInfo.
 *                 categoryId:
 *                   type: string
 *                   description: The ID of the category this GameInfo belongs to.
 *                 gameId:
 *                   type: string
 *                   description: The ID of the game this GameInfo is associated with.
 *       404:
 *         description: GameInfo not found.
 *       500:
 *         description: Error fetching the GameInfo.
 */
router.get("/:gameInfoId", async (req, res) => {
  const { gameInfoId } = req.params;

  try {
    const gameInfo = await prisma.gameInfo.findUnique({
      where: { id: gameInfoId },
    });

    if (gameInfo) {
      res.json(gameInfo);
    } else {
      res.status(404).send("GameInfo not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching the GameInfo");
  }
});

/**
 * @swagger
 * /createGameInfo:
 *   post:
 *     summary: Create GameInfo
 *     tags: [GameInfo]
 *     description: Creates a new GameInfo entry.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - categoryId
 *               - gameId
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               gameId:
 *                 type: string
 *     responses:
 *       302:
 *         description: Redirects to the game info page.
 *       500:
 *         description: Error creating entry.
 */

router.post("/addGameInfo", async (req, res) => {
  const { title, content, categoryId, gameId } = req.body;
  try {
    const newEntry = await prisma.gameInfo.create({
      data: {
        title: title,
        content: content,
        categoryId: categoryId,
        gameId: gameId,
      },
    });
    res.json(newEntry);
  } catch (error) {
    res.status(500).send("Error creating entry");
  }
});

/**
 * @swagger
 * /update/{gameInfoId}:
 *   put:
 *     summary: Update GameInfo
 *     tags: [GameInfo]
 *     description: Updates the information of a specific GameInfo including its category.
 *     parameters:
 *       - in: path
 *         name: gameInfoId
 *         required: true
 *         description: GameInfo ID.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - categoryId  # Added categoryId as required for category update
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               categoryId:    # New field for category ID
 *                 type: string
 *     responses:
 *       200:
 *         description: GameInfo updated successfully.
 *       500:
 *         description: Error updating GameInfo.
 */

router.put("/update/:gameInfoId", async (req, res) => {
  const { gameInfoId } = req.params;
  const { title, content, categoryId } = req.body;

  try {
    const updateEntry = await prisma.gameInfo.update({
      where: { id: gameInfoId },
      data: {
        title,
        content,
        categoryId,
      },
    });

    res.json(updateEntry);
  } catch (error) {
    res.status(500).send("Error updating GameInfo");
  }
});

/**
 * @swagger
 * /delete/{gameInfoId}:
 *   delete:
 *     summary: Delete GameInfo
 *     tags: [GameInfo]
 *     description: Deletes a specific GameInfo entry.
 *     parameters:
 *       - in: path
 *         name: gameInfoId
 *         required: true
 *         description: GameInfo ID.
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirects to the game info page.
 *       500:
 *         description: Error deleting entry.
 */

router.delete("/delete/:gameInfoId", async (req, res) => {
  const { gameInfoId } = req.params;

  try {
    const gameInfo = await prisma.gameInfo.findUnique({
      where: { id: gameInfoId },
      include: {
        category: true,
      },
    });

    await prisma.gameInfo.delete({
      where: { id: gameInfoId },
    });

    res.json(`Entry deleted`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting entry");
  }
});


module.exports = router;
