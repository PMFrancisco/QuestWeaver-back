const express = require("express");
const router = express.Router();
const prisma = require("../prisma");

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
          profileImage: profileImage,
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
 * tags:
 *   name: User
 */

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: View user profile
 *     tags: [User]
 *     description: Renders the user's profile page.
 *     responses:
 *       200:
 *         description: Profile page rendered.
 */
router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await prisma.profile.findUnique({
      where: { firebaseUserID: userId },
    });
    res.json( user );
  } catch (error) {
    res.status(500).send("Error getting the profile");
  }
});

/**
 * @swagger
 * /profile/edit:
 *   get:
 *     summary: Edit user profile page
 *     tags: [User]
 *     description: Renders the page for editing the user's profile.
 *     responses:
 *       200:
 *         description: Edit profile page rendered.
 *       500:
 *         description: Server Error.
 */

router.get("/edit", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await prisma.user.findUnique({
      where: { firebaseUserID: userId },
    });
    res.json( user);
  } catch (error) {
    res.status(500).send("Error editing the profile");
  }
});

module.exports = router;
