const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 3500;
const corsOptions = require("./config/corsOptions");
const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const path = require("path");
const fileUpload = require("express-fileupload");
const { fileExtLimiter } = require("./middleware/fileExtLimiter");
const { fileSizeLimiter } = require("./middleware/fileSizeLimiter");
const { filesPayloadExist } = require("./middleware/filesPayloadExist");

app.use(logger);
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "/public")));
app.use("/subdir", express.static(path.join(__dirname, "/public")));

// Route for serving the HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Route for handling file uploads
app.post(
  "/upload",
  fileUpload({ createParentPath: true }),
  filesPayloadExist,
  fileExtLimiter([".png", ".jpg", ".jpeg"]),
  fileSizeLimiter,
  (req, res) => {
    // Log the uploaded files
    console.log(req.files);

    Object.keys(req.files).forEach((key) => {
      const filepath = path.join(__dirname, "files", req.files[key].name);
      req.files[key].mv(filepath, (err) => {
        if (err) return res.status(500).json({ status: "error", message: err });
      });
    });

    // Send JSON response
    return res.json({
      status: "success",
      message: Object.keys(req.files).toString(),
    });
  }
);

// Handle 404 errors
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

// Error handling middleware
app.use(errorHandler);

// Start the server
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
