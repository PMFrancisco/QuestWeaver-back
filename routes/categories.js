const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

/**
 * @swagger
 * /addCategory:
 *   post:
 *     summary: Add Category
 *     tags: [GameInfo]
 *     description: Creates a new category or subcategory for the game.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - categoryName
 *               - gameId
 *             properties:
 *               categoryName:
 *                 type: string
 *               gameId:
 *                 type: string
 *               parentId:
 *                 type: string
 *     responses:
 *       302:
 *         description: Redirects back to the previous page.
 *       500:
 *         description: Error creating category or subcategory.
 */

router.post("/addCategory", async (req, res) => {
  const { categoryName, gameId, parentId } = req.body;
  try {
    await prisma.category.create({
      data: {
        name: categoryName,
        gameId: gameId,
        parentId: parentId || null,
      },
    });
    res.json("Added category");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating category or subcategory");
  }
});

/**
 * @swagger
 * /{gameId}:
 *   get:
 *     summary: Main GameInfo Wiki
 *     tags: [GameInfo]
 *     description: Renders the main wiki page for a specific game.
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         description: Game ID.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Main wiki page rendered.
 *       500:
 *         description: Error loading the wiki.
 */

router.get("/:gameId", async (req, res) => {
  const { gameId } = req.params;

  try {
    const categories = await prisma.category.findMany({
      where: { gameId: gameId, parentId: null },
      include: {
        children: {
          include: {
            gameInfos: true,
          },
        },
        gameInfos: true,
      },
    });

    res.json({ categories, gameId });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error loading the wiki");
  }
});

module.exports = router;
