# WAIGIT Troubleshooting Guide

## Network Request Failed Errors

If you're seeing "Network request failed" or "Token exchange error" errors, follow these steps:

### 1. Check Backend Server is Running

Make sure your backend server is running:

```bash
cd backend
npm run dev
```

You should see:
```
Server is running on port 3000
```

### 2. Configure Backend URL for Physical Devices

**The Problem:** `localhost` doesn't work on physical devices because it refers to the device itself, not your computer.

**The Solution:** Use your computer's IP address instead.

#### Find Your Computer's IP Address

**Windows:**
```powershell
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually starts with 192.168.x.x or 10.0.x.x)

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```
Or:
```bash
ip addr show
```

#### Update app.json

Edit `waigit/app.json` and update the `backendUrl`:

```json
{
  "expo": {
    "extra": {
      "backendUrl": "http://YOUR_IP_ADDRESS:3000"
    }
  }
}
```

Example:
```json
{
  "expo": {
    "extra": {
      "backendUrl": "http://192.168.1.100:3000"
    }
  }
}
```

#### Platform-Specific Defaults

The app will automatically use:
- **Android Emulator**: `http://10.0.2.2:3000` (maps to host machine's localhost)
- **iOS Simulator**: `http://localhost:3000` (works directly)
- **Physical Devices**: Uses the value from `app.json` or defaults to localhost (which won't work)

### 3. Ensure Devices Are on Same Network

- Your computer and mobile device must be on the same Wi-Fi network
- Make sure your firewall allows connections on port 3000
- Some corporate networks block device-to-device communication

### 4. Configure GitHub OAuth Credentials

Add to your backend `.env` file:

```env
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

Get these from: https://github.com/settings/developers

### 5. Test Backend Endpoint

Test if your backend is accessible:

```bash
# From your computer
curl http://localhost:3000/api/github/token -X POST -H "Content-Type: application/json" -d '{"code":"test","redirectUri":"waigit://auth"}'
```

You should get an error about invalid code, but it means the endpoint is reachable.

### 6. Check CORS Configuration

The backend should allow requests from your mobile app. The default CORS configuration includes:
- `exp://localhost:8081` (Expo Go)
- `waigit://` (WAIGIT app scheme)

If you're still having issues, check `backend/src/app.js` CORS configuration.

### 7. Common Error Messages

**"Network request failed"**
- Backend server not running
- Wrong backend URL (using localhost on physical device)
- Firewall blocking connection
- Devices not on same network

**"Backend URL not configured"**
- Update `app.json` with `backendUrl` in `extra` section

**"GitHub OAuth not configured on server"**
- Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` to backend `.env`

**"Failed to exchange code for token"**
- Invalid GitHub OAuth credentials
- Wrong redirect URI in GitHub OAuth App settings
- Backend can't reach GitHub API

### 8. Debug Steps

1. **Check backend logs** - Look for error messages when the request comes in
2. **Check mobile app logs** - Use Expo DevTools or React Native Debugger
3. **Test backend directly** - Use curl or Postman to test the endpoint
4. **Verify network connectivity** - Ping your computer's IP from the device (if possible)

### 9. Quick Test Checklist

- [ ] Backend server is running (`npm run dev` in backend folder)
- [ ] Backend URL in `app.json` uses your computer's IP (not localhost)
- [ ] Computer and device on same Wi-Fi network
- [ ] GitHub OAuth credentials in backend `.env`
- [ ] GitHub OAuth App callback URL matches `waigit://auth`
- [ ] Firewall allows port 3000

### Still Having Issues?

1. Check the backend console for error messages
2. Check the mobile app console/logs
3. Verify all configuration values are correct
4. Try restarting both backend and mobile app
5. Clear app cache/data and try again

