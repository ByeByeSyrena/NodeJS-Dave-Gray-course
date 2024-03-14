const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 3500;
const corsOptions = require("./config/corsOptions");
const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");

const path = require("path");

//custom middleware for to listen to events
app.use(logger);

app.use(cors(corsOptions));

//built-in middleware to handle urlencoded data
app.use(express.urlencoded({ extended: false }));

//built-in middleware for json
app.use(express.json());

//serve static files
app.use(express.static(path.join(__dirname, "/public")));
app.use("/subdir", express.static(path.join(__dirname, "/public")));

app.use("/", require("./routes/root"));
app.use("/subdir", require("./routes/subdir"));
app.use("/employees", require("./routes/api/employees"));

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

//place middlewares one by one and root with them just after functions otherwise it does not work
// const one = (req, res, next) => {
//   console.log("one");
//   next();
// };

// const two = (req, res, next) => {
//   console.log("two");
//   next();
// };

// const three = (req, res, next) => {
//   console.log("three");
//   res.send("Finished");
// };

// app.get("/chain(.html)?", [one, two, three]);

//^ - must begin with
//$ - must in with
//| - or
//(.html)? - optional html
// app.get("^/$|index(.html)?", (req, res) => {
//   res.send("Hello World");
//   res.sendFile("./views/index.html", { root: __dirname });
//   res.sendFile(path.join(__dirname, "views", "index.html"));
// });

// app.get("/new-page(.html)?", (req, res) => {
//   res.sendFile(path.join(__dirname, "views", "new-page.html"));
// });

// app.get("/old-page(.html)?", (req, res) => {
//   res.redirect(301, "/new-page.html");
//302 by default
// });

//Route handlers

// app.get(
//   "/hello(.html)?",
//   (req, res, next) => {
//     console.log("attempted to load hello.html");
//     next();
//   },
//   (req, res) => {
//     res.send("Hello world");
//   }
// );

//app.use('/')
// app.get("/*", (req, res) => {
//   res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
// });

//app.use - more for middleware, app.all - for routing
