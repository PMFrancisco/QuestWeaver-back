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
 * /newGameInfo/{gameId}/{categoryId}:
 *   get:
 *     summary: New GameInfo page
 *     tags: [GameInfo]
 *     description: Renders the page for creating new GameInfo.
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         description: Game ID.
 *         schema:
 *           type: string
 *       - in: path
 *         name: categoryId
 *         required: true
 *         description: Category ID.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: New GameInfo page rendered.
 *       500:
 *         description: Error loading the page.
 */

router.get("/newGameInfo/:gameId/:categoryId", async (req, res) => {
  const { gameId, categoryId } = req.params;
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            gameInfos: true,
          },
        },
        gameInfos: true,
      },
    });

    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    res.json({
      categories,
      game,
      gameId,
      categoryId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading the page");
  }
});

module.exports = router;
