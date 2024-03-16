const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const handleLogin = async (req, res) => {
  const cookies = req.cookies;
  console.log(`cookie available at login: ${JSON.stringify(cookies)}`);
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
    const roles = Object.values(foundUser.roles).filter(Boolean);
    // create JWTs
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: foundUser.username,
          roles: roles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "10s" }
    );
    const newRefreshToken = jwt.sign(
      { username: foundUser.username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    // Changed to let keyword
    let newRefreshTokenArray = !cookies?.jwt
      ? foundUser.refreshToken
      : foundUser.refreshToken.filter((rt) => rt !== cookies.jwt);

    if (cookies?.jwt) {
      /* 
            Scenario added here: 
                1) User logs in but never uses RT and does not logout 
                2) RT is stolen
                3) If 1 & 2, reuse detection is needed to clear all RTs when user logs in
            */
      const refreshToken = cookies.jwt;
      const foundToken = await User.findOne({ refreshToken }).exec();

      // Detected refresh token reuse!
      if (!foundToken) {
        console.log("attempted refresh token reuse at login!");
        // clear out ALL previous refresh tokens
        newRefreshTokenArray = [];
      }

      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
    }

    // Saving refreshToken with current user
    foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
    const result = await foundUser.save();
    console.log(result);
    console.log(roles);

    // Creates Secure Cookie with refresh token
    res.cookie("jwt", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Send authorization roles and access token to user
    res.json({ roles, accessToken });
  } else {
    res.sendStatus(401);
  }
};

module.exports = { handleLogin };

//For example, Chrome and other Chromium-based browsers enforce a requirement that cookies marked with SameSite=None must also be set with the Secure attribute, meaning they are only sent over secure (HTTPS) connections. If the Secure attribute is not present, such cookies are treated as if they have SameSite=Lax.
//By setting SameSite=Lax, the browser will only send cookies with same-site requests, i.e., requests initiated by navigating to the website from the same origin (domain). It's important to note that SameSite=Lax provides limited protection against CSRF attacks compared to SameSite=Strict.
//SameSite=Strict is a value for the SameSite attribute of cookies, which is used to define the restrictions on when cookies should be sent in HTTP requests. When a cookie is set with SameSite=Strict, it will only be sent along with "same-site" requests, meaning requests originating from the same site or origin as the website that set the cookie.
