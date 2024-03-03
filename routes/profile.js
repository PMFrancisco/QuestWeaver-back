const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

const upload = require("../config/multer");
const handleUpload = require("../middlewares/handleUpload");

/**
 * @swagger
 * tags:
 *   name: User
 */

/**
 * @swagger
 * /profile:
 *   post:
 *     summary: Create or update user profile
 *     tags: [User]
 *     description: Creates a new user profile if it doesn't exist, otherwise updates the existing profile.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firebaseUserID:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               displayName:
 *                 type: string
 *               profileImage:
 *                 type: string
 *     responses:
 *       200:
 *         description: User profile created or updated successfully.
 *       500:
 *         description: Internal Server Error.
 */
router.post("/", async (req, res) => {
  const { firebaseUserID, firstName, lastName, displayName, profileImage } =
    req.body;

  try {
    let user = await prisma.profile.findUnique({
      where: { firebaseUserID: firebaseUserID },
    });

    if (!user) {
      user = await prisma.profile.create({
        data: {
          firebaseUserID,
          firstName,
          lastName,
          displayName,
          profileImage,
        },
      });
    } else {
    }

    res.json(user);
  } catch (error) {
    console.error("Error handling profile creation/update:", error);
    res.status(500).send("Server error");
  }
});

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: View user profile
 *     tags: [User]
 *     description: Retrieves the user's profile information.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: Renders the user's profile page.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile information retrieved successfully.
 *       500:
 *         description: Internal Server Error.
 */

router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await prisma.profile.findUnique({
      where: { firebaseUserID: userId },
    });
    res.json(user);
  } catch (error) {
    res.status(500).send("Error getting the profile");
  }
});

/**
 * @swagger
 * /profile/edit/{userId}:
 *   put:
 *     summary: Edit user profile
 *     tags: [User]
 *     description: Updates the user's profile information.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user whose profile is to be edited.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - displayName
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               displayName:
 *                 type: string
 *     responses:
 *       200:
 *         description: User profile updated successfully.
 *       500:
 *         description: Internal Server Error.
 */

router.put("/edit/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const updateResult = await prisma.profile.update({
      where: { firebaseUserID: userId },
      data: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        displayName: req.body.displayName,
      },
    });
    res.json(updateResult);
  } catch (error) {
    res.status(500).send("Error updating the profile");
  }
});

/**
 * @swagger
 * /profile/updateProfilePicture/{userId}:
 *   post:
 *     summary: Update profile picture
 *     tags: [User]
 *     description: Uploads and updates the user's profile picture.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user whose profile picture is to be updated.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture updated successfully.
 *       500:
 *         description: Internal Server Error.
 */

router.post(
  "/updateProfilePicture/:userId",
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const userId = req.params.userId;

      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const cldRes = await handleUpload(dataURI);

      await prisma.profile.update({
        where: { firebaseUserID: userId },
        data: { profileImage: cldRes.secure_url },
      });

      res.json("Image updated");
    } catch (error) {
      res.status(500).send("Error updating the profile");
    }
  }
);

module.exports = router;
