const express = require("express");
const app = express();
const port = 3000;

const cookieParser = require("cookie-parser");
const connect = require("./schemas");
const postRouter = require("./routes/posts.js");
const commentRouter = require("./routes/comments.js");
const usersRouter = require("./routes/users.js");
const authRouter = require("./routes/auth.js");

connect();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/", [postRouter, commentRouter, usersRouter, authRouter]);

app.listen(port, () => {
  console.log(port, "포트로 서버가 열렸어요!");
});
