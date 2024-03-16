const path = require("path");

const fileExtLimiter = (AllowedExtArray) => {
  return (req, res, next) => {
    const files = req.files;
    const fileExtensions = [];

    Object.keys(req.files).forEach((key) => {
      fileExtensions.push(path.extname(files[key].name));
    });

    //Are the file extensions allowed?

    const allowed = fileExtensions.every((ext) =>
      AllowedExtArray.includes(ext)
    );

    if (!allowed) {
      const message =
        `Upload failed. Only ${AllowedExtArray.toString()} files allowed.`.replaceAll(
          ",",
          ", "
        );

      return res.status(422).json({ status: "error", message });
    }

    next();
  };
};

module.exports = { fileExtLimiter };
