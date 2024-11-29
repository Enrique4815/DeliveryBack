const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Keys = require('./keys');
const User = require('../models/user')

module.exports = (passport) => {
    let opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
    opts.secretOrKey = Keys.secretOrKey;

    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        User.findById(jwt_payload.id, (err, user) => {
            if (err) {
                return done(err, false);
            }
            if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        })
    }))

    
    passport.serializeUser((user, done) => {
        done(null, user.id); // Guarda el id del usuario en la sesión
      });
      
      passport.deserializeUser((id, done) => {
        // Recupera la información del usuario desde la base de datos
        User.findById(id, (err, user) => {
          done(err, user);
        });
      });
      

}