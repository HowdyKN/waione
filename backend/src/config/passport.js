const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { User, OAuthProvider } = require('../models');
const authConfig = require('./auth');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (authConfig.oauth.google.clientID && authConfig.oauth.google.clientSecret) {
  passport.use(new GoogleStrategy({
    clientID: authConfig.oauth.google.clientID,
    clientSecret: authConfig.oauth.google.clientSecret,
    callbackURL: authConfig.oauth.google.callbackURL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Find or create OAuth provider
      let oauthProvider = await OAuthProvider.findOne({
        where: {
          provider: 'google',
          providerId: profile.id
        },
        include: [{ model: User, as: 'user' }]
      });

      if (oauthProvider) {
        // Update tokens
        await oauthProvider.update({
          accessToken,
          refreshToken,
          email: profile.emails?.[0]?.value
        });
        return done(null, oauthProvider.user);
      }

      // Check if user exists with this email
      const email = profile.emails?.[0]?.value;
      let user = await User.findOne({ where: { email } });

      if (!user) {
        // Create new user
        user = await User.create({
          email,
          firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User',
          lastName: profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '',
          isEmailVerified: true
        });
      }

      // Create OAuth provider entry
      await OAuthProvider.create({
        userId: user.id,
        provider: 'google',
        providerId: profile.id,
        email,
        accessToken,
        refreshToken
      });

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
}

// Facebook OAuth Strategy
if (authConfig.oauth.facebook.clientID && authConfig.oauth.facebook.clientSecret) {
  passport.use(new FacebookStrategy({
    clientID: authConfig.oauth.facebook.clientID,
    clientSecret: authConfig.oauth.facebook.clientSecret,
    callbackURL: authConfig.oauth.facebook.callbackURL,
    profileFields: ['id', 'displayName', 'email', 'name']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Find or create OAuth provider
      let oauthProvider = await OAuthProvider.findOne({
        where: {
          provider: 'facebook',
          providerId: profile.id
        },
        include: [{ model: User, as: 'user' }]
      });

      if (oauthProvider) {
        await oauthProvider.update({
          accessToken,
          email: profile.emails?.[0]?.value
        });
        return done(null, oauthProvider.user);
      }

      const email = profile.emails?.[0]?.value;
      let user = await User.findOne({ where: { email } });

      if (!user) {
        user = await User.create({
          email,
          firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User',
          lastName: profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '',
          isEmailVerified: !!email
        });
      }

      await OAuthProvider.create({
        userId: user.id,
        provider: 'facebook',
        providerId: profile.id,
        email,
        accessToken
      });

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));
}

// Apple OAuth Strategy (simplified - full implementation requires additional setup)
// Note: Apple OAuth requires additional configuration and may need a different package

module.exports = passport;










