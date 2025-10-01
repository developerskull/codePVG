import passport from 'passport';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import pool from '../utils/database';

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

// LinkedIn OAuth Strategy - only initialize if credentials are provided and not empty
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET &&
    process.env.LINKEDIN_CLIENT_ID.trim() !== '' && process.env.LINKEDIN_CLIENT_SECRET.trim() !== '') {
  passport.use(
    new LinkedInStrategy(
      {
        clientID: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        callbackURL: process.env.LINKEDIN_CALLBACK_URL || 'http://localhost:5000/api/auth/linkedin/callback',
        scope: ['r_emailaddress', 'r_liteprofile', 'r_basicprofile'],
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
          // Check if user already exists with this LinkedIn ID
          const existingUser = await pool.query(
            'SELECT * FROM users WHERE linkedin_id = $1',
            [profile.id]
          );

          if (existingUser.rows.length > 0) {
            return done(null, existingUser.rows[0]);
          }

          // Extract college information from LinkedIn profile
          let collegeName = null;
          let collegeId = null;

          // LinkedIn API v2 education data
          if (profile._json && profile._json.education) {
            const education = profile._json.education;
            if (education.length > 0) {
              const latestEducation = education[0];
              collegeName = latestEducation.schoolName;
            }
          }

          // If college name found, try to find or create college record
          if (collegeName) {
            const collegeResult = await pool.query(
              'SELECT id FROM colleges WHERE name = $1',
              [collegeName]
            );

            if (collegeResult.rows.length > 0) {
              collegeId = collegeResult.rows[0].id;
            } else {
              // Create new college entry
              const newCollege = await pool.query(
                'INSERT INTO colleges (name) VALUES ($1) RETURNING id',
                [collegeName]
              );
              collegeId = newCollege.rows[0].id;
            }
          }

          // Determine approval status
          // If college is identified, set to pending
          // If no college info, also set to pending (requires admin approval)
          const approvalStatus = 'pending';

          // Create new user
          const newUser = await pool.query(
            `INSERT INTO users (
              name, email, linkedin_id, college_id, 
              approval_status, verified, role
            ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *`,
            [
              profile.displayName || profile.name?.givenName + ' ' + profile.name?.familyName,
              profile.emails?.[0]?.value,
              profile.id,
              collegeId,
              approvalStatus,
              false,
              'student'
            ]
          );

          return done(null, newUser.rows[0]);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
} else {
  console.warn('⚠️  LinkedIn OAuth not configured. Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in .env to enable.');
}

export default passport;
