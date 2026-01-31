# WAIGIT Setup Guide

Quick setup guide to get WAIGIT running on your device.

## Step 1: Install Dependencies

```bash
cd waigit
npm install
```

## Step 2: Create GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: `WAIGIT`
   - **Homepage URL**: `https://github.com` (or your website)
   - **Authorization callback URL**: 
     - For Expo Go: `exp://localhost:8081`
     - For development: `waigit://auth`
4. Click "Register application"
5. **Copy the Client ID** (you'll need this)
6. **Generate a new client secret** and copy it (you'll need this for the backend)

## Step 3: Configure Mobile App

Edit `waigit/app.json`:

```json
{
  "expo": {
    "extra": {
      "githubClientId": "Ov23liyvEDxvs5YWU17Z",
      "backendUrl": "http://192.168.1.248:3000"
    }
  }
}
```

**Note:** 
- The GitHub Client ID is already configured for WAIGIT (`Ov23liyvEDxvs5YWU17Z`)
- Update `backendUrl` to your computer's IP address for physical devices
- For Android emulator: The app automatically uses `http://10.0.2.2:3000`
- For iOS simulator: The app automatically uses `http://localhost:3000`

## Step 4: Set Up Backend Endpoint

See `BACKEND_SETUP.md` for detailed instructions on creating the token exchange endpoint.

Quick version:
1. The GitHub token exchange endpoint is already created at `backend/src/routes/github.js`
2. Add to backend `.env`:
   ```
   GITHUB_CLIENT_ID=Ov23liyvEDxvs5YWU17Z
   GITHUB_CLIENT_SECRET=your_client_secret_here
   ```
3. CORS is already configured to allow requests from WAIGIT app

## Step 5: Run the App

```bash
npm start
```

Then:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go on your physical device

## Troubleshooting

### "Backend URL not configured"
- Make sure you've set `backendUrl` in `app.json`
- For physical devices, use your computer's IP address (not localhost)
- Ensure your backend is running
- Check that the endpoint is accessible

### "Failed to exchange code for token"
- Verify your backend endpoint is working (test with curl)
- Check that `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set in backend `.env`
- Ensure the callback URL in GitHub OAuth App matches what you're using

### "Authentication cancelled"
- User cancelled the OAuth flow - this is normal
- Try again and complete the authorization

### Repositories not loading
- Check that you granted the `repo` scope during OAuth
- Verify your token is valid
- Check network connectivity

## Next Steps

- Customize the app theme and colors
- Add more repository management features
- Implement repository search and filtering
- Add pull request management
- Add issue creation and management

