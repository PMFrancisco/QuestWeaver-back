const express = require("express");
const router = express.Router();
const prisma = require("../prisma"); 

router.post("/", async (req, res) => {
  const { firebaseUserID, email, firstName, lastName, displayName, profileImage } = req.body;

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
          profileImage: profileImage},
      });
    } else {
     
    }

    res.json(user);
  } catch (error) {
    console.error("Error handling profile creation/update:", error);
    res.status(500).send("Server error");
  }
});

module.exports = router;
