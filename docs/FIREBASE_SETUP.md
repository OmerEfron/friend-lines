# Firebase Setup for Android Push Notifications

Android push notifications require Firebase Cloud Messaging (FCM). Follow these steps:

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Follow the setup wizard

## 2. Add Android App to Firebase

1. In Firebase Console, click the Android icon
2. Register your app:
   - **Package name**: `com.friendlines.app` (must match app.json)
   - **App nickname**: Friendlines (optional)
   - **Debug signing certificate SHA-1**: Optional for now
3. Click "Register app"

## 3. Download google-services.json

1. Download the `google-services.json` file
2. Place it in the **project root** (same directory as `app.json`)
3. The file is already referenced in `app.json`:
   ```json
   "android": {
     "googleServicesFile": "./google-services.json"
   }
   ```

## 4. Upload FCM Credentials to EAS

**Note:** Firebase deprecated the legacy Cloud Messaging API on June 20, 2024. Expo's push notification service handles the migration to HTTP v1 API automatically.

1. In Firebase Console, go to **Project Settings** → **Service Accounts**
2. Click **Generate New Private Key** to download a JSON service account file
3. Run:
   ```bash
   eas credentials
   ```
4. Select Android platform
5. Choose "Push Notifications" → "FCM Server Key" or "Service Account"
6. Upload the service account JSON file (or follow EAS prompts)

**Alternative:** If EAS still accepts the legacy server key format:
- Go to Project Settings → Cloud Messaging
- Enable "Cloud Messaging API (Legacy)" if needed (though it's deprecated)
- Copy the Server key and paste it in EAS

**Important:** Expo's push notification service abstracts FCM communication, so the v1 migration is handled by Expo on their backend.

## 5. Rebuild Your App

After adding `google-services.json`, you must rebuild:

```bash
# For development build
eas build --platform android --profile development

# Or for local build
npx expo run:android
```

## Verification

After rebuilding and installing on a physical device:
- The Firebase initialization error should be gone
- Push token registration should work
- You can test with Expo's push notification tool

## Troubleshooting

**Error: "Default FirebaseApp is not initialized"**
- Make sure `google-services.json` is in project root
- Verify the package name in `google-services.json` matches `com.friendlines.app`
- Rebuild the app after adding the file

**Error: "FCM server key not found"**
- Make sure you uploaded FCM credentials via `eas credentials`
- Use the service account JSON file (recommended) or legacy server key
- Verify credentials are correct in Firebase Console
- Note: Legacy API is deprecated - use service account if possible

## Notes

- `google-services.json` should be **committed** to the repository (contains client-side config)
- The FCM service account key should **NOT** be committed (upload via EAS only)
- For production, use different Firebase projects for dev/prod
- Expo's push notification service handles FCM HTTP v1 API migration automatically
- The file is automatically included in builds by Expo

