// server/config/passport.ts
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import UserModel from '../models/User';

export const configurePassport = () => {
  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, (user as any)._id.toString());
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await UserModel.findById(id).select('-password');
      if (user) {
        (user as any).userId = user._id.toString();
        (user as any).role = user.role || 'user';
      }
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google profile:', profile);
      
      // Check if user exists with googleId
      let user = await UserModel.findOne({ googleId: profile.id });
      
      if (!user) {
        // Check if user exists with same email
        user = await UserModel.findOne({ email: profile.emails?.[0].value });
        
        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          user.provider = 'google';
          user.avatar = profile.photos?.[0].value || user.avatar;
          user.lastLogin = new Date();
          await user.save();
          
          console.log(`Linked Google account to existing user: ${user.email}`);
        } else {
          // Create new user with Google
          user = new UserModel({
            name: profile.displayName,
            email: profile.emails?.[0].value,
            googleId: profile.id,
            provider: 'google',
            avatar: profile.photos?.[0].value,
            isActive: true,
            lastLogin: new Date()
          });
          await user.save();
          
          console.log(`Created new user with Google: ${user.email}`);
        }
      } else {
        // Update last login for existing Google user
        user.lastLogin = new Date();
        await user.save();
      }
      
      return done(null, user);
    } catch (error) {
      console.error('Google auth error:', error);
      return done(error as Error, undefined);
    }
  }));
};