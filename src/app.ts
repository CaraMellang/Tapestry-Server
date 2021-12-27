import express from "express";

const app = express();

app.get(`/`, (req, res, next) => {
  res.send("Hello!!");
});

const port = 5000;

app.listen(port, () => {
  console.log(`listening port ${port}`);
});

