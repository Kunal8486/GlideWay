const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const Rider = require("../Models/Rider");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5500/api/auth/google/callback", // Make sure this matches your Google Developer Console settings
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await Rider.findOne({ googleId: profile.id });
        if (existingUser) {
          return done(null, existingUser); // User already exists, return the user
        }

        // If the user does not exist, create a new one
        const newRider = new Rider({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          profile_picture_url: profile.photos[0].value,
          is_verified: true,
        });

        await newRider.save();
        done(null, newRider); // Return newly created user
      } catch (err) {
        done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id); // Serialize the user id for the session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Rider.findById(id);
    done(null, user); // Deserialize and return the user from the database
  } catch (err) {
    done(err, null);
  }
});
