<!--
Contributors:
  Rachel Koh - 3 hours
  Emma Reid - 1 hour
-->

# Grading Material: APK

This is an Android app. We have submitted the latest APK build of the app with the submission of our final project.

To access it:

1. Download the APK file on your mobile device
2. Install it on your Android mobile device
   - You may have to grant permissions to install unknown apps
   - For a more in-depth explanation, see [this blog post from Android Authority](https://www.androidauthority.com/how-to-install-apks-31494/)
3. Sign-in with your _Vanderbilt_ Microsoft account

> [!IMPORTANT]
> You cannot run the app on an iOS device.

If you would prefer to recreate the APK file:

1. Clone this repository and ensure you have all prerequisites (see instructions below in APK Generation)
2. Run `bun run android`
   - NOTE: You may have to install Expo Go, Expo Orbit, and Android Studio
3. In the terminal output, look for lines with something like:
   ```bash
   # QR code and Expo CLI options...
   › Installing /path-to-cloned-folder/weshare/android/app/build/outputs/apk/debug/app-debug.apk
   › Opening weshare://expo-development-client on Medium_Phone_API_36.0
   # ... More info lines
   ```
4. Access the `.apk` file at the specified path
5. Send the file to an Android mobile device where you can download and install it (see instructions above). You may also be able to run the APK on your Android simulator on a laptop, but certain functionality may not match the experience on a physical device exactly (e.g. input bars do not open the keyboard)

## Firebase

- Firebase project is named WeShare. [Firestore](https://console.firebase.google.com/u/0/project/weshare-c1834/firestore/databases/-default-/data) is built within that Firebase project.
- [Official Firebase docs](https://firebase.google.com/docs/firestore/quickstart#node.js) - code examples
  React Native Projects are considered Web modular API projects.
- [ReactNative + Expo specific docs](https://rnfirebase.io/]) - helpful for setup
- [Expo Specific Docs](https://docs.expo.dev/guides/using-firebase/) - explain more about firebaseConfig.js

On the free plan, we are currently [limited](https://firebase.google.com/pricing?authuser=0&_gl=1*snijf2*_ga*MjA2NDUwMjc0Ny4xNzU5MjUyMjE5*_ga_CW55HF8NVT*czE3NTkyNzExNTYkbzIkZzEkdDE3NTkyNzE0MTckajExJGwwJGgw) but should have enough free access for starting out.

We are currently in test mode (The default security rules for test mode allow anyone with your database reference to view, edit and delete all data in your database for the next 30 days)

## Security/Authentication

- We are using Expo [SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/) to store authentication data.
- It will primarily just store the user id which will identify the user in the database.
- [More info](https://reactnative.dev/docs/security) on handling sensitive data in ReactNative.
- Using Microsoft login to require Vanderbilt login following [this document](https://medium.com/@shaikabbas101/microsoft-authentication-in-react-native-using-react-native-app-auth-3041565e914c)
- Using expo-auth-session instead of react-native-app-auth due to compatibility issues with Expo
- Redirect URI: com.wesharenative://oauth/auth/
- Expo Go always has a changing redirect uri which must be updated in Azure each time the project is run. This issue is specific to Expo Go and would not affect production as production would have a stable uri.
- Weshare login secret will be valid for 6 months (until 11 April 2026)

## Testing

- Unit tests: [Jest](https://docs.expo.dev/develop/unit-testing/)

  ```bash
  bun run test
  ```
Coverage report will be generated in the terminal when finished.

## APK Generation

- Run `bunx expo prebuild --platform android --clean`
- Create `local.properties` file in android folder and add this line (assuming this is where your SDK is, can check in file explorer): sdk.dir=C:/Users/username/AppData/Local/Android/Sdk
- Run `cd android`
- Run `./gradlew clean`
   - If get "Failed to delete some children. This might happen because a process has files open or has its working directory set in the target directory." just run the command again.
- In `/weshare/android/app/build.gradle` add `manifestPlaceholders = [appAuthRedirectScheme: "weshare"]` in the defaultConfige (right below `buildConfigField...`)
- Check `/weshare/android/app/src/main/AndroidManifest.xml` and replace `android:scheme="weshare"` with `android:scheme="${appAuthRedirectScheme}"` (there may be multiple occurences)
- Run `./gradlew assembleRelease`
- APK can be found in `/weshare/android/app/build/outputs/apk/release/`
- Link to debugging conversation with chat https://chatgpt.com/share/691697f0-1d20-8012-97d8-f42bdbc33191

# Using Bun

A guide on using Bun with Expo and EAS.

[Bun](https://bun.sh/) is a JavaScript runtime and a drop-in alternative for [Node.js](https://nodejs.org/en). In Expo projects, Bun can be used to install npm packages and run Node.js scripts. The benefits of using Bun are faster package installation than npm, pnpm, or Yarn and [at least 4x faster startup time compared to Node.js](https://bun.sh/docs#design-goals), which gives a huge boost to your local development experience.

## Prerequisites

> **Note:** While Bun replaces Node.js for most use cases in your project, at this time, a [Node.js LTS version](https://nodejs.org/) is still required to be installed for the `bun create expo` and `bun expo prebuild` commands. These commands use `npm pack` to download project templates.

To create a new app using Bun, [install Bun on your local machine](https://bun.sh/docs/installation#installing).

## Get started

1. Install dependencies

   ```bash
   bun install
   ```

2. Start the app (alt: see 3)

   ```bash
   bun run start
   ```

   From here, you can open the app in your mobile emulators using:
   - <kbd>a</kbd> for Android
   - <kbd>i</kbd> for iOS

   The full output lists the full options. Links to docs:
   - [development build](https://docs.expo.dev/develop/development-builds/introduction/)
   - [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
   - [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
   - [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

   You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

   Make sure your emulators are launched BEFORE you try to run your app on them.

3. Run the app in a (launched) emulator

   ```bash
   # launch in ios
   bun run ios
   ```

   ```bash
   # launch in android
   bun run android
   ```

## Formatting and Linting

We use ESLint for linting and Prettier for formatting

```
# linting with ESLint
bunx expo lint

# formatting with prettier
bunx prettier --write .
```

## Miscellaneous

To install any Expo library, you can use `bun expo install`:

```bash
bun expo install expo-av
```

## Use Bun for EAS builds

EAS decides which package manager to use based on the lockfile in your codebase. If you want EAS to use Bun, run `bun install` in your codebase which will create a **bun.lockb** (the Bun lockfile). As long as this lockfile is in your codebase, Bun will be used as the package manager for your builds. Make sure to delete any lockfiles generated by other package managers.

### Customize Bun version on EAS

Bun is installed by default when using EAS. See the [Android server images](/build-reference/infrastructure/#android-server-images) and [iOS server images](/build-reference/infrastructure/#ios-server-images) to learn which version of Bun is used by your build's image.

To use an [exact version of Bun](/eas/json/#bun) with EAS, add the version number in **eas.json** under the build profile's configuration. For example, the configuration below specifies Bun version `1.0.0` for the `development` build profile:

```json eas.json
{
  "build": {
    "development": {
      /* @info Use <CODE>bun</CODE> property in eas.json to specify the exact version.*/
      "bun": "1.0.0" /* @end */
      /* @end */
      /* @hide ... */
    } /* @end */
    /* @hide ... */
  }
}
```

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](httpsnpx://docs.expo.dev/router/introduction).

## Trusted dependencies

Unlike other package managers, Bun does not automatically execute lifecycle scripts from installed libraries, as this is considered a security risk. However, if a package you are installing has a `postinstall` script that you want to run, you have to explicitly state that by including that library in your [`trustedDependencies`](https://bun.sh/guides/install/trusted) array in your **package.json**.

For example, if you install `packageA`, which has a dependency on `packageB` and `packageB` has a `postinstall` script, you must add `packageB` in your `trustedDependencies`.

To add a trusted dependency in your **package.json**, add:

```json package.json
"trustedDependencies": ["your-dependency"]
```

Then, remove your lockfile and re-install the dependencies:

```bash
rm -rf node_modules', '$ rm bun.lockb', '$ bun install']}
```

## Common errors

### EAS Build fails when using Sentry and Bun

If you're using `sentry-expo` or `@sentry/react-native`, these depend on `@sentry/cli`, which updates source maps to Sentry during your build. The `@sentry/cli` package has a `postinstall` script which needs to run for the "upload source maps" script to become available.

To fix this, add `@sentry/cli` to your [trusted dependencies](/#trusted-dependencies) array in **package.json**:

```json package.json
"trustedDependencies": ["@sentry/cli"]
```

## Get a fresh project

When you're ready, run:

```bash
bun run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
