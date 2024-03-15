const usersDB = {
  users: require("../model/users.json"),
  setUsers: function (data) {
    this.users = data;
  },
};

const jwt = require("jsonwebtoken");
require("dotenv").config();

const handleRefreshToken = (req, res) => {
  // Retrieve cookies from the request
  const cookies = req.cookies;

  // Check if refresh token is present in cookies
  if (!cookies?.jwt) return res.sendStatus(401); // Unauthorized

  // Extract the refresh token from cookies
  const refreshToken = cookies.jwt;

  // Find the user associated with the refresh token
  const foundUser = usersDB.users.find(
    (person) => person.refreshToken === refreshToken
  );

  // If no user is found, send forbidden response
  if (!foundUser) return res.sendStatus(403); // Forbidden

  // Verify the refresh token
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    // If there's an error or the decoded username doesn't match the user's username, send forbidden response
    if (err || foundUser.username !== decoded.username)
      return res.sendStatus(403); // Forbidden

    // Generate a new access token
    const accessToken = jwt.sign(
      { username: decoded.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" }
    );

    // Send the new access token in the response
    res.json({ accessToken });
  });
};

module.exports = { handleRefreshToken };
