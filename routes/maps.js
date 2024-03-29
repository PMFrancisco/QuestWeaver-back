const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

const upload = require("../config/multer");
const handleUpload = require("../middlewares/handleUpload");

/**
 * @swagger
 * tags:
 *   name: Maps
 */

/**
 * @swagger
 * /map/{id}:
 *   get:
 *     summary: View game map
 *     tags: [Maps]
 *     description: Renders the game map along with tokens.
 *     security:
 *       - isAcceptedOrGameCreator: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Game ID.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Game map page rendered.
 *       500:
 *         description: Internal Server Error.
 */

router.get("/:gameId", async (req, res) => {
  try {
    const { gameId } = req.params;

    const map = await prisma.map.findFirst({
      where: { gameId: gameId },
      select: { mapData: true },
    });

    const tokens = await prisma.token.findMany({
      where: { OR: [{ isCustom: false }, { gameId: gameId }] },
    });

    if (!map) {
      return res
        .status(404)
        .json({ error: "Map not found for the given gameId" });
    }

    res.json({
      mapUrl: map.mapData.backgroundImageUrl,
      drawnElements: map.mapData.drawnElements,
      game: { id: gameId },
      tokens: tokens,
    });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

/**
 * @swagger
 * /map/uploadMap:
 *   post:
 *     summary: Upload game map
 *     tags: [Maps]
 *     description: Uploads a map image for a specific game.
 *     security:
 *       - isGameCreator: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - mapImage
 *               - gameId
 *             properties:
 *               mapImage:
 *                 type: string
 *                 format: binary
 *               gameId:
 *                 type: string
 *     responses:
 *       302:
 *         description: Redirects to the map page.
 *       500:
 *         description: Internal Server Error.
 */

router.post(
  "/uploadMap/:gameId",
  upload.single("mapImage"),
  async (req, res) => {
    const { gameId } = req.params;
    try {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const cldRes = await handleUpload(dataURI);
      const mapUrl = cldRes.secure_url;

      const existingMap = await prisma.map.findFirst({
        where: { gameId: gameId },
      });

      if (existingMap) {
        await prisma.map.update({
          where: { id: existingMap.id },
          data: {
            mapData: {
              ...existingMap.mapData,
              backgroundImageUrl: mapUrl,
            },
          },
        });
      } else {
        await prisma.map.create({
          data: {
            name: "Map Name",
            mapData: {
              backgroundImageUrl: mapUrl,
              tokens: [],
            },
            gameId: gameId,
          },
        });
      }
      res.json(existingMap);
    } catch (error) {
      res.redirect("/error");
    }
  }
);

/**
 * @swagger
 * /map/saveMapStatus/{gameId}:
 *   post:
 *     summary: Save map status
 *     tags: [Maps]
 *     description: Saves the current state of the map and tokens.
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: string
 *         description: The game ID to which the map belongs.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mapData
 *             properties:
 *               mapData:
 *                 type: object
 *                 description: The state of the map, including URLs, drawn elements, and any other relevant information.
 *                 properties:
 *                   mapUrl:
 *                     type: string
 *                     description: URL of the map background image.
 *                   drawnElements:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         color:
 *                           type: string
 *                         size:
 *                           type: number
 *                         points:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               x:
 *                                 type: number
 *                               y:
 *                                 type: number
 *     responses:
 *       200:
 *         description: Map status updated successfully.
 *       404:
 *         description: Map not found.
 *       500:
 *         description: Internal Server Error.
 */

router.post("/saveMapStatus/:gameId", async (req, res) => {
  try {
    const { gameId } = req.params;
    const { mapData } = req.body;

    const existingMap = await prisma.map.findFirst({
      where: { gameId: gameId },
    });

    if (existingMap) {
      await prisma.map.update({
        where: { id: existingMap.id },
        data: {
          mapData: mapData,
        },
      });
      res.json({ message: "Map status updated successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
