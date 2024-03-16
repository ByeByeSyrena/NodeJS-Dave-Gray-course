const User = require("../model/User");

const jwt = require("jsonwebtoken");

const handleRefreshToken = async (req, res) => {
  // Retrieve cookies from the request
  const cookies = req.cookies;

  // Check if refresh token is present in cookies
  if (!cookies?.jwt) return res.sendStatus(401); // Unauthorized

  // Extract the refresh token from cookies
  const refreshToken = cookies.jwt;

  // Find the user associated with the refresh token
  const foundUser = await User.findOne({ refreshToken }).exec();

  // If no user is found, send forbidden response
  if (!foundUser) return res.sendStatus(403); // Forbidden

  // Verify the refresh token
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    // If there's an error or the decoded username doesn't match the user's username, send forbidden response
    if (err || foundUser.username !== decoded.username)
      return res.sendStatus(403); // Forbidden
    const roles = Object.values(foundUser.roles);
    // Generate a new access token
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: decoded.username,
          roles: roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30s" }
    );

    // Send the new access token in the response
    res.json({ accessToken });
  });
};

module.exports = { handleRefreshToken };
