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
 *   put:
 *     summary: Edit user profile
 *     tags: [User]
 *     description: Updates the user's profile information.
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
 *       302:
 *         description: Redirects to the profile page.
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
    res.json(updateResult)
  } catch (error) {
    console.error("Error updating the profile:", error);
    res.status(500).send("Error updating the profile");
  }
});


module.exports = router;
