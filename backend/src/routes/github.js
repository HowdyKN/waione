const express = require('express');
const router = express.Router();

/**
 * GitHub OAuth Token Exchange Endpoint
 * 
 * This endpoint exchanges a GitHub OAuth authorization code for an access token.
 * The client secret is stored on the backend and never exposed to the mobile app.
 * 
 * POST /api/github/token
 * Body: { code: string, redirectUri: string }
 */
router.post('/token', async (req, res) => {
  try {
    const { code, redirectUri } = req.body;

    // Validate input
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Authorization code is required',
      });
    }

    if (!redirectUri) {
      return res.status(400).json({
        success: false,
        error: 'Redirect URI is required',
      });
    }

    // Get GitHub OAuth credentials from environment
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('GitHub OAuth credentials not configured in environment variables');
      return res.status(500).json({
        success: false,
        error: 'GitHub OAuth not configured on server',
      });
    }

    // Exchange code for access token with GitHub
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('GitHub token exchange error:', errorText);
      return res.status(tokenResponse.status).json({
        success: false,
        error: 'Failed to exchange code for token with GitHub',
      });
    }

    const tokenData = await tokenResponse.json();

    // Check for GitHub API errors
    if (tokenData.error) {
      console.error('GitHub OAuth error:', tokenData);
      return res.status(400).json({
        success: false,
        error: tokenData.error_description || tokenData.error,
      });
    }

    if (!tokenData.access_token) {
      return res.status(500).json({
        success: false,
        error: 'No access token received from GitHub',
      });
    }

    // Return the access token to the mobile app
    res.json({
      success: true,
      access_token: tokenData.access_token,
      token_type: tokenData.token_type || 'bearer',
      scope: tokenData.scope,
    });
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during token exchange',
      ...(process.env.NODE_ENV === 'development' && {
        details: error.message,
      }),
    });
  }
});

module.exports = router;

