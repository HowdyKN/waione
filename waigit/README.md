# WAIGIT - GitHub Repository Manager

A React Native mobile app built with Expo that allows you to connect to your GitHub profile and manage your repositories on the go.

## Features

- 🔐 GitHub OAuth authentication
- 📦 View all your repositories
- 🔍 Detailed repository information
- 🌿 Browse branches
- 📝 View commits
- 🐛 Check issues
- 👤 User profile management

## Prerequisites

- Node.js (v18+)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- A GitHub OAuth App (see setup instructions below)

## Setup Instructions

### 1. Install Dependencies

```bash
cd waigit
npm install
```

### 2. Create GitHub OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: WAIGIT
   - **Homepage URL**: `https://github.com` (or your website)
   - **Authorization callback URL**: 
     - For Expo Go: `exp://localhost:8081`
     - For development: `waigit://auth`
     - For production: Your app's deep link URL
4. Click "Register application"
5. Copy the **Client ID** and **Client Secret**

### 3. Configure OAuth Credentials

**Important**: For production, you should use a backend server to handle the OAuth token exchange. The client secret should NEVER be exposed in the mobile app.

#### Option A: Using a Backend Proxy (Recommended)

1. Set up a backend endpoint to exchange the OAuth code for a token
2. Update `src/services/githubAuth.js`:
   - Replace `YOUR_BACKEND_URL` with your backend URL
   - The backend should handle the token exchange using the client secret

#### Option B: Direct Configuration (Development Only)

1. Update `src/services/githubAuth.js`:
   - Replace `YOUR_GITHUB_CLIENT_ID` with your GitHub OAuth App Client ID
   - For development, you can temporarily use a test token

### 4. Update App Configuration

Update `app.json` with your GitHub OAuth credentials (optional, if using environment variables):

```json
{
  "extra": {
    "githubClientId": "YOUR_GITHUB_CLIENT_ID",
    "githubClientSecret": "YOUR_GITHUB_CLIENT_SECRET"
  }
}
```

### 5. Run the App

```bash
npm start
```

Then:
- Press `a` for Android
- Press `i` for iOS
- Scan the QR code with Expo Go app

## Project Structure

```
waigit/
├── src/
│   ├── context/
│   │   └── GitHubAuthContext.js    # Authentication context
│   ├── navigation/
│   │   ├── AuthNavigator.js        # Auth flow navigation
│   │   └── MainNavigator.js        # Main app navigation
│   ├── screens/
│   │   ├── auth/
│   │   │   └── LoginScreen.js      # GitHub OAuth login
│   │   ├── RepositoriesScreen.js   # Repository list
│   │   ├── RepositoryDetailScreen.js # Repository details
│   │   └── ProfileScreen.js        # User profile
│   └── services/
│       ├── githubAuth.js           # GitHub OAuth service
│       └── githubApi.js            # GitHub API client
├── App.js                          # Main app entry point
├── app.json                        # Expo configuration
└── package.json                    # Dependencies
```

## GitHub API Scopes

The app requests the following GitHub OAuth scopes:
- `repo` - Full control of private repositories
- `read:user` - Read user profile information
- `user:email` - Access user email addresses

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never expose your Client Secret** in the mobile app code
2. Use a backend proxy for token exchange in production
3. Store tokens securely using AsyncStorage (already implemented)
4. Implement token refresh if needed
5. Consider using GitHub Apps instead of OAuth Apps for better security

## Backend Integration (Optional)

For production, create a backend endpoint to handle OAuth token exchange:

```javascript
// Example backend endpoint
app.post('/api/github/token', async (req, res) => {
  const { code, redirectUri } = req.body;
  
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
    }),
  });
  
  const data = await response.json();
  res.json({ access_token: data.access_token });
});
```

## Features in Detail

### Repository List
- View all your repositories
- Filter by type (all, owner, member)
- Sort by update date, creation date, etc.
- Pull to refresh

### Repository Details
- Overview with stats (stars, forks, issues, watchers)
- Browse branches
- View recent commits
- Check open issues
- Open repository in GitHub

### Profile
- View your GitHub profile
- See followers, following, and repository count
- Logout functionality

## Troubleshooting

### "Unable to authenticate" error
- Check that your GitHub OAuth App callback URL matches
- Verify Client ID is correct
- Ensure you have internet connectivity

### "Token exchange failed"
- Set up a backend proxy for token exchange
- Check that your backend endpoint is accessible
- Verify Client Secret is correct on the backend

### Repositories not loading
- Check your GitHub token is valid
- Verify you have the `repo` scope granted
- Check network connectivity

## License

ISC

