"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_linkedin_oauth2_1 = require("passport-linkedin-oauth2");
const database_1 = __importDefault(require("../utils/database"));
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const result = await database_1.default.query('SELECT * FROM users WHERE id = $1', [id]);
        done(null, result.rows[0]);
    }
    catch (error) {
        done(error, null);
    }
});
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET &&
    process.env.LINKEDIN_CLIENT_ID.trim() !== '' && process.env.LINKEDIN_CLIENT_SECRET.trim() !== '') {
    passport_1.default.use(new passport_linkedin_oauth2_1.Strategy({
        clientID: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        callbackURL: process.env.LINKEDIN_CALLBACK_URL || 'http://localhost:5000/api/auth/linkedin/callback',
        scope: ['r_emailaddress', 'r_liteprofile', 'r_basicprofile'],
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const existingUser = await database_1.default.query('SELECT * FROM users WHERE linkedin_id = $1', [profile.id]);
            if (existingUser.rows.length > 0) {
                return done(null, existingUser.rows[0]);
            }
            let collegeName = null;
            let collegeId = null;
            if (profile._json && profile._json.education) {
                const education = profile._json.education;
                if (education.length > 0) {
                    const latestEducation = education[0];
                    collegeName = latestEducation.schoolName;
                }
            }
            if (collegeName) {
                const collegeResult = await database_1.default.query('SELECT id FROM colleges WHERE name = $1', [collegeName]);
                if (collegeResult.rows.length > 0) {
                    collegeId = collegeResult.rows[0].id;
                }
                else {
                    const newCollege = await database_1.default.query('INSERT INTO colleges (name) VALUES ($1) RETURNING id', [collegeName]);
                    collegeId = newCollege.rows[0].id;
                }
            }
            const approvalStatus = 'pending';
            const newUser = await database_1.default.query(`INSERT INTO users (
              name, email, linkedin_id, college_id, 
              approval_status, verified, role
            ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *`, [
                profile.displayName || profile.name?.givenName + ' ' + profile.name?.familyName,
                profile.emails?.[0]?.value,
                profile.id,
                collegeId,
                approvalStatus,
                false,
                'student'
            ]);
            return done(null, newUser.rows[0]);
        }
        catch (error) {
            return done(error, null);
        }
    }));
}
else {
    console.warn('⚠️  LinkedIn OAuth not configured. Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in .env to enable.');
}
exports.default = passport_1.default;
//# sourceMappingURL=passport.js.map