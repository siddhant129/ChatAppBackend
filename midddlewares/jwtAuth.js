const { expressjwt: jwt, expressjwt } = require("express-jwt");
const jsonwebtoken = require("jsonwebtoken");

require("dotenv/config");
const { secret, API_URL } = process.env;
function jwtAuth() {
  return expressjwt({
    secret,
    algorithms: ["HS256"],
    getToken: (req) => {
      if (req.headers.authorization) {
        if (req.headers.authorization.split(" ")[0] === "Bearer") {
          const token = req.headers.authorization.split(" ")[1];
          const payload = jsonwebtoken.decode(token);
          req.userId = payload.userId;
          return token;
        } else {
          const token = req.headers.authorization.split(" ")[0];
          const payload = jsonwebtoken.decode(token);
          req.userId = payload.userId;
          return token;
        }
      }
      return null;
    },
  }).unless({});
}

module.exports = jwtAuth;
