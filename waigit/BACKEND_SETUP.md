# Backend Setup for WAIGIT

This guide shows you how to set up a backend endpoint to securely handle GitHub OAuth token exchange.

## Why a Backend is Required

GitHub OAuth requires a **Client Secret** to exchange the authorization code for an access token. The Client Secret must **NEVER** be exposed in mobile app code. Therefore, you need a backend server to handle this exchange securely.

## Backend Endpoint Example

Add this endpoint to your existing backend (e.g., in `backend/src/routes/auth.js` or create a new route file):

### Express.js Example

```javascript
const express = require('express');
const router = express.Router();
require('dotenv').config();

// GitHub OAuth token exchange endpoint
router.post('/github/token', async (req, res) => {
  try {
    const { code, redirectUri } = req.body;

    if (!code) {
      return res.status(400).json({ 
        error: 'Authorization code is required' 
      });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('GitHub token exchange error:', errorText);
      return res.status(tokenResponse.status).json({ 
        error: 'Failed to exchange code for token' 
      });
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).json({ 
        error: tokenData.error_description || tokenData.error 
      });
    }

    // Return the access token to the mobile app
    res.json({
      access_token: tokenData.access_token,
      token_type: tokenData.token_type || 'bearer',
      scope: tokenData.scope,
    });
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ 
      error: 'Internal server error during token exchange' 
    });
  }
});

module.exports = router;
```

### Add to Your Backend App

1. **Add the route to your main app file** (`backend/src/app.js`):

```javascript
const githubRoutes = require('./routes/github'); // or wherever you put it
app.use('/api', githubRoutes);
```

2. **Add environment variables** to your `.env` file:

```env
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

3. **Update the mobile app** (`waigit/src/services/githubAuth.js`):

```javascript
const BACKEND_URL = 'http://localhost:3000'; // Your backend URL
// Or for production:
// const BACKEND_URL = 'https://your-api.com';
```

## Security Considerations

1. **CORS Configuration**: Make sure your backend allows requests from your mobile app:
   ```javascript
   const cors = require('cors');
   app.use(cors({
     origin: ['exp://localhost:8081', 'waigit://'], // Add your app origins
     credentials: true,
   }));
   ```

2. **Rate Limiting**: Add rate limiting to prevent abuse:
   ```javascript
   const rateLimit = require('express-rate-limit');
   const githubTokenLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 10 // limit each IP to 10 requests per windowMs
   });
   router.post('/github/token', githubTokenLimiter, async (req, res) => {
     // ... your code
   });
   ```

3. **Input Validation**: Validate the incoming request:
   ```javascript
   const { body, validationResult } = require('express-validator');
   
   router.post('/github/token', 
     body('code').notEmpty().isString(),
     body('redirectUri').notEmpty().isString(),
     async (req, res) => {
       const errors = validationResult(req);
       if (!errors.isEmpty()) {
         return res.status(400).json({ errors: errors.array() });
       }
       // ... your code
     }
   );
   ```

## Testing the Endpoint

You can test the endpoint using curl:

```bash
curl -X POST http://localhost:3000/api/github/token \
  -H "Content-Type: application/json" \
  -d '{
    "code": "your_authorization_code_here",
    "redirectUri": "waigit://auth"
  }'
```

Expected response:
```json
{
  "access_token": "gho_xxxxxxxxxxxx",
  "token_type": "bearer",
  "scope": "repo,read:user,user:email"
}
```

## Alternative: Using Your Existing Backend

If you already have a backend (like the WAI1 backend), you can add this endpoint to your existing `backend/src/routes/auth.js` file or create a new `backend/src/routes/github.js` file.

## Production Deployment

When deploying to production:

1. Update `BACKEND_URL` in the mobile app to your production backend URL
2. Ensure your backend has the production GitHub OAuth App credentials
3. Update CORS settings to allow your production app origins
4. Use HTTPS for all API calls
5. Consider adding request logging and monitoring

