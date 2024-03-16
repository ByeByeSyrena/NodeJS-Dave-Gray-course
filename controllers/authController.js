const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const handleLogin = async (req, res) => {
  const { user, pwd } = req.body;
  if (!user || !pwd)
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  const foundUser = await User.findOne({ username: user }).exec();
  if (!foundUser) return res.sendStatus(401); //Unauthorized
  // evaluate password
  const match = await bcrypt.compare(pwd, foundUser.password);
  if (match) {
    const roles = Object.values(foundUser.roles);
    // create JWTs
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username,
          roles: roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "5m" }
    );
    const refreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    // Saving refreshToken with current user
    foundUser.refreshToken = refreshToken;
    const result = await foundUser.save();
    console.log(result);

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "None", //only with https, read comment below
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken });
  } else {
    res.sendStatus(401);
  }
};

module.exports = { handleLogin };

//For example, Chrome and other Chromium-based browsers enforce a requirement that cookies marked with SameSite=None must also be set with the Secure attribute, meaning they are only sent over secure (HTTPS) connections. If the Secure attribute is not present, such cookies are treated as if they have SameSite=Lax.
//By setting SameSite=Lax, the browser will only send cookies with same-site requests, i.e., requests initiated by navigating to the website from the same origin (domain). It's important to note that SameSite=Lax provides limited protection against CSRF attacks compared to SameSite=Strict.
//SameSite=Strict is a value for the SameSite attribute of cookies, which is used to define the restrictions on when cookies should be sent in HTTP requests. When a cookie is set with SameSite=Strict, it will only be sent along with "same-site" requests, meaning requests originating from the same site or origin as the website that set the cookie.
