const jwt = require("jsonwebtoken");

const verify = async (req, res) => {
  const token = req.header("x-auth");
  jwt.verify(token, "nourhany", (err, authInfo) => {
    if (err) {
      Promise.reject(err);
    }
    req.authInfo = authInfo;
    if (!authInfo || !authInfo.isAdmin) {
      return res.sendStatus(401);
    }
    Promise.resolve(true);
  });
};

const adminMiddleware = async (req, res, next) => {
  try {
    if (!verify(req, res)) {
      return res.sendStatus(402);
    }
    next();
  } catch (error) {
    return res.sendStatus(403);
  }
};

module.exports = { adminMiddleware };
