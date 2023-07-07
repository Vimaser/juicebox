const PORT = 3000;
const express = require("express");
const server = express();
const apiRouter = require("./api");
const { client, getUserById, updateUser } = require("./db");
client.connect();
const morgan = require("morgan");

require("dotenv").config();
console.log(process.env.JWT_SECRET);

server.use(morgan("dev"));
server.use(express.json());
server.use("/api", apiRouter);

/* server.get("/background/:color", (req, res, next) => {
  res.send(`
      <body style="background: ${req.params.color};">
        <h1>Hello World</h1>
      </body>
    `);
});

server.get("/add/:first/to/:second", (req, res, next) => {
  res.send(
    `<h1>${req.params.first} + ${req.params.second} = ${
      Number(req.params.first) + Number(req.params.second)
    }</h1>`
  );
}); */


server.delete("/api/users/:userId", async (req, res, next) => {
    try {
      const userId = req.params.userId;
        
      // user exists
      const user = await getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // user is logged in
      if (req.user.id !== user.id) {
        return res.status(403).json({ message: "Forbidden: You can only delete your own account" });
      }
      
      // user has left the building like Elvis
      const updatedUser = await updateUser(userId, { active: false });
  
      res.status(200).json({ message: "User deleted successfully", user: updatedUser });
    } catch (error) {
      next(error);
    }
  });
  // it works!
  
server.listen(PORT, () => {
  console.log("The server is up on port", PORT);
});
