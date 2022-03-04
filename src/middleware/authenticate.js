var { User } = require('../models/User');
const _ = require('lodash');

var authenticate = (req, res, next) => {
  const token = req.header('x-auth');

  User.findByToken(token)
    .then(user => {
      if (!user) {
        return Promise.reject();
      }
      let result = _.pick(user, [
        '_id',
        'email',
        'name',
        'dateofbirth',
        'gender',
        'city',
        'desc',
        'foi',
        'bio',
        'softwares',
        'company',
        'portfolio',
        'website',
        'createdat'
      ]);

      req.user = result;
      req.token = token;
      next();
    })
    .catch(e => {
      res.status(401).send();
    });
};

module.exports = { authenticate };
