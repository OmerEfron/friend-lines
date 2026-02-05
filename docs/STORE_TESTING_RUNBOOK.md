# Store Testing Runbook

This guide walks you through deploying Friendlines for **external testing** via:
- **Android**: Google Play Console Internal Testing
- **iOS**: App Store Connect TestFlight (External Testing)

## Prerequisites

Before starting, ensure you have:
- [ ] Node.js 18+ installed
- [ ] EAS CLI installed: `npm install -g eas-cli`
- [ ] Expo account created at https://expo.dev
- [ ] Git with this repository cloned

---

## Part 1: One-Time Account Setup

### 1.1 Google Play Developer Account

1. Go to https://play.google.com/console
2. Sign in with your Google account
3. Pay the one-time $25 registration fee
4. Complete account identity verification (may take 24-48 hours for new accounts)

### 1.2 Apple Developer Program

1. Go to https://developer.apple.com/programs
2. Sign in with your Apple ID
3. Enroll in the Apple Developer Program ($99/year)
4. Complete identity verification

### 1.3 EAS Authentication

```bash
# Login to your Expo account
eas login

# Verify you're logged in
eas whoami
```

---

## Part 2: One-Time App Setup

### 2.1 Create App in Google Play Console

1. Go to Play Console → **Create app**
2. Fill in:
   - App name: `Friendlines`
   - Default language: English
   - App type: App
   - Free/Paid: Free
3. Accept declarations and **Create app**
4. Note the package name must match: `com.friendlines.app`

### 2.2 Create App in App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - Platform: iOS
   - Name: `Friendlines`
   - Primary language: English
   - Bundle ID: `com.friendlines.app`
   - SKU: `friendlines-app` (unique identifier)
4. Click **Create**
5. Note the **Apple ID** number (you'll need it for `eas.json`)

### 2.3 Update eas.json with App Store Connect ID

Edit `eas.json` and replace `YOUR_APP_STORE_CONNECT_APP_ID` with the Apple ID from step 2.2:

```json
{
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "1234567890"
      }
    }
  }
}
```

### 2.4 Set Up Google Service Account for EAS Submit

For automated Android submissions, create a Google Cloud service account:

1. Go to https://console.cloud.google.com
2. Create a new project (or use existing)
3. Enable **Google Play Android Developer API**
4. Go to **IAM & Admin** → **Service Accounts**
5. Create service account with a descriptive name
6. Grant role: **Service Account User**
7. Create JSON key and download it
8. In Play Console → **Setup** → **API access**:
   - Link your Google Cloud project
   - Grant the service account **Admin** access

Store the JSON key securely (do NOT commit to git).

Configure EAS to use it:

```bash
eas credentials --platform android
# Select "Service account key"
# Upload your JSON key file
```

### 2.5 Enable GitHub Pages for Privacy Policy

1. Go to your GitHub repository → **Settings** → **Pages**
2. Source: Deploy from a branch
3. Branch: `main` (or your default branch)
4. Folder: `/docs`
5. Save

Your privacy policy will be available at:
```
https://<username>.github.io/friendlines/legal/PRIVACY_POLICY
```

### 2.6 Complete Store Metadata

#### Google Play Console

1. **Store listing**: Add app description, screenshots, feature graphic
2. **App content** → **Privacy policy**: Enter your GitHub Pages URL
3. **App content** → **Data safety**: Complete the questionnaire
   - Collects: Account info, User content, Device identifiers
   - Shares: None sold; shared with service providers
4. **App content** → **App access**: If login required, provide test credentials
5. **App content** → **Target audience**: Select appropriate age group

#### App Store Connect

1. **App Information** → **Privacy Policy URL**: Enter your GitHub Pages URL
2. **App Privacy**: Complete data collection questionnaire
3. **Pricing and Availability**: Set to Free
4. **General** → **App Review Information**: Provide test credentials if needed

---

## Part 3: Build and Submit (Per Release)

### 3.1 Bump Version Numbers

Before each new release, increment version numbers in `app.json`:

```json
{
  "expo": {
    "version": "1.0.1",           // Semantic version (visible to users)
    "ios": {
      "buildNumber": "2"          // Increment for each iOS build
    },
    "android": {
      "versionCode": 2            // Increment for each Android build
    }
  }
}
```

**Important**: 
- `versionCode` (Android) and `buildNumber` (iOS) MUST be higher than previous uploads
- Store uploads will be rejected if these numbers aren't incremented

### 3.2 Build for Both Platforms

```bash
# Build Android (produces AAB for Play Store)
eas build --platform android --profile production

# Build iOS (produces IPA for App Store)
eas build --platform ios --profile production

# Or build both at once
eas build --platform all --profile production
```

Wait for builds to complete. You can monitor at https://expo.dev/accounts/[your-username]/projects/friendlines/builds

### 3.3 Submit to Stores

```bash
# Submit Android to Play Console Internal Testing
eas submit --platform android --profile production

# Submit iOS to TestFlight
eas submit --platform ios --profile production
```

**Shortcut for iOS** (build + submit in one command):
```bash
npx testflight
```

---

## Part 4: Invite Testers

### 4.1 Android: Play Console Internal Testing

1. Go to Play Console → **Testing** → **Internal testing**
2. Click **Create email list** (or edit existing)
3. Add your 20 testers' email addresses
4. Save the list
5. Click **Create new release** (if first time)
6. The AAB from EAS Submit should already be uploaded
7. **Save** → **Review release** → **Start rollout**
8. Copy the **opt-in URL** and share with testers

Testers must:
1. Click the opt-in URL and accept
2. Install via Play Store (may take a few minutes to appear)

### 4.2 iOS: TestFlight External Testing

1. Go to App Store Connect → **TestFlight** tab
2. Your build should appear (processing takes ~15 minutes)
3. Click **External Testing** → **+** to create a group
4. Name it (e.g., "Friends Beta")
5. Add your 20 testers' email addresses
6. Select your build
7. Fill in **What to Test** description
8. Click **Submit for Review**

**Beta App Review** typically takes 24-48 hours. Once approved:
- Testers receive email invitation
- Install via TestFlight app (available on App Store)

---

## Part 5: Troubleshooting

### Build Failures

```bash
# Check build logs
eas build:list
eas build:view [BUILD_ID]

# Clear cache and rebuild
eas build --platform [android|ios] --profile production --clear-cache
```

### Submission Failures

```bash
# Check submission status
eas submit --platform [android|ios] --verbose

# Common issues:
# - Version code not incremented
# - Missing store metadata
# - Invalid credentials
```

### Android: "App not published yet"

New apps require completing ALL store listing information before internal testing works. Check:
- Store listing (title, description, screenshots)
- Content ratings
- App content declarations

### iOS: Build Processing Stuck

- Processing typically takes 10-30 minutes
- If stuck > 1 hour, the build may have issues
- Check email for Apple notifications
- Re-upload if necessary

---

## Quick Reference Commands

```bash
# Login
eas login

# Build production (both platforms)
eas build --platform all --profile production

# Submit Android to internal testing
eas submit --platform android --profile production

# Submit iOS to TestFlight
eas submit --platform ios --profile production

# Check build status
eas build:list --platform all --limit 5

# One-liner for iOS (build + submit)
npx testflight
```

---

## Version History

| Version | versionCode (Android) | buildNumber (iOS) | Notes |
|---------|----------------------|-------------------|-------|
| 1.0.0   | 1                    | 1                 | Initial test release |

*Update this table as you release new versions*
