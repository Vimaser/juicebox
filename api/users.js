const express = require("express");
const usersRouter = express.Router();
const { getAllUsers, getUserByUsername, createUser, getUserById, updateUser } = require("../db");
const jwt = require("jsonwebtoken");
require("dotenv").config();

usersRouter.use((req, res, next) => {
  console.log("A request is being made to /users");

  next();
});

usersRouter.get("/", async (req, res) => {
  const users = await getAllUsers();

  res.send({
    users,
  });
});

usersRouter.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    next({
      name: "MissingCredentialsError",
      message: "Please supply both a username and password",
    });
  }

  try {
    const user = await getUserByUsername(username);

    if (user && user.password === password) {
      const token = jwt.sign(
        { id: user.id, username: user.name },
        process.env.JWT_SECRET
      );

      res.send({ message: "you're logged in!", token });
    } else {
      next({
        name: "IncorrectCredentialsError",
        message: "Username or password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

usersRouter.post("/register", async (req, res, next) => {
  const { username, password, name, location } = req.body;

  try {
    const _user = await getUserByUsername(username);

    if (_user) {
      next({
        name: "UserExistsError",
        message: "A user by that username already exists",
      });
    }
    const user = await createUser({
      username,
      password,
      name,
      location,
    });

    const token = jwt.sign(
      {
        id: user.id,
        username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1w",
      }
    );

    res.send({
      message: "thank you for signing up",
      token,
    });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

/* usersRouter.delete("/:userid", async (req, res, next) => {
    try {
      const userid = await req.params.userid();
  
      const users = getUserById(userid);
        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (req.user.id !== user.id) {
            return res.status(403).json({ message: "Forbidden: You can only delete your own account"});
        }

        const udatedUser = await updateUser(userid, { active: false });

        res.status(200).json({ message: "User deleted successfully.", user: udatedUser });
    } catch (error) {
        next(error);
    }
}); */
// curl command as follows: curl -X DELETE -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJOZXduYW1lIFNvZ29vZCIsImlhdCI6MTY4ODc0NTUyM30.IPn0oaUaFza4CvZ3OHCOrwq-aK1Smhs1ARferAbKGvw" http://localhost:3000/users/12345

usersRouter.delete("/userid", async (req, res, next) => {
    try {
      const userId = req.params.userId;
  
      // Verify that the user exists
      const user = await getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Verify that the logged-in user is the one being deleted
      if (req.user.id !== user.id) {
        return res.status(403).json({ message: "Forbidden: You can only delete your own account" });
      }
  
      // Update the user's active status to false
      const updatedUser = await updateUser(userId, { active: false });
  
      res.status(200).json({ message: "User deleted successfully", user: updatedUser });
    } catch (error) {
      next(error);
    }
  });
  // ??? run through the code. We're hitting the right endpoint / , /user , /userid
  // User exists
  // 

module.exports = usersRouter;
