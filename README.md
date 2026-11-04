# NekokoLPA 1

[日本語](./README_ja.md)

NekokoLPA 1 is the legacy React Native Local Profile Assistant (LPA) for
managing eSIM profiles on compatible eUICCs. It targets Android and iOS, with
a Mac Catalyst build of the iOS app.

[NekokoLPA 2](https://github.com/iebb/NekokoLPA2) is the separate Flutter
successor and is already open source under the MIT license. Its source and
[downloads](https://github.com/iebb/NekokoLPA2/releases) are available now.
See also the [project website](https://n.lpa.ee).

## Supported reader kinds

The following support is implemented in
[`deviceManager.ts`](./src/lpa/deviceManager.ts) and the
[`adapters`](./src/lpa/adapters/). Reader discovery and usable card access also
depend on the operating system, permissions, reader firmware, and the eUICC's
access rules.

| Reader kind | Platform / discovery |
| --- | --- |
| Internal SIM/eUICC slots through OMAPI | Android; access depends on the slot and the app's signing certificate |
| USB CCID readers | Android USB host interface |
| USB CCID readers through CryptoTokenKit | iOS and Mac Catalyst; readers must be exposed by the OS |
| [ESTKme-RED](https://www.estk.me/product/estkme-red/?aid=nekoko), first-generation Bluetooth protocol | Android and iOS; names matching `estkme[-_]?red` |
| ESTKme RED, second-generation Bluetooth protocol (CCID framing) | Android and iOS; names matching `estkme\s+red` |
| BeeSIM Bluetooth readers | Android and iOS; names beginning with `beesim` |
| Legacy 9eSIM / SimLink Bluetooth readers (Nordic UART JSON protocol) | Android and iOS; names beginning with `esim_writer` |

Bluetooth name matching is case-insensitive. The space in `ESTKme RED`
distinguishes its protocol from `ESTKme-RED`; the second-generation match is
checked first. The legacy 9eSIM adapter does not imply support for every newer
9eSIM reader or firmware.

## Development

Run commands from this repository's root.

### Toolchain

The app uses:

| Component | Version |
| --- | --- |
| React Native | `0.88.1` |
| React | `19.3.1` |
| Node.js | `^22.13.0 \|\| ^24.3.0 \|\| >=26.0.0` |
| Yarn | `3.6.4` (repository-pinned) |
| Apple toolchain | Xcode `27.2` with the iOS `27.2` SDK |
| Android toolchain | JDK `17`, compile SDK / Build Tools `37`, Gradle `9.4.1` |

The app requires iOS 16 or Android 9 (API 28) and continues to target Android
API 36. The compile SDK is separate from the minimum supported OS version.

For iPhone Duo, the app supports dynamic resizing through the `UIScene`
lifecycle with a single application scene. The UI must respond to changes in
the current window's dimensions as the device folds or unfolds, without
restarting the app or creating a second scene. Validate resizing in both
directions, including navigation, dialogs, and safe areas. On iOS 27.1 and
later, a local safe-area-context patch reads the system's reserved fold
regions. Screens, sheets, and progress overlays use the trailing or bottom
pane while partially open, then regain the full display when unfolded.

### Setup and run

```bash
yarn install
bash apply_variant.sh store   # Generate the default variant's config and assets
yarn pod-install              # iOS / Mac Catalyst only; requires CocoaPods
yarn ios 'iPhone Duo'          # Requires an available simulator with this name
```

`apply_variant.sh` also rewrites native configuration and assets. Run it when
initializing or deliberately switching variants, and review its changes when
working on native files. `src/assets/config.json` and
`src/assets/images/logo.png` are generated per variant and intentionally
untracked.

`yarn ios` runs `scripts/run-ios.sh`, which drives `xcodebuild` and `simctl`
directly. It accepts a simulator name as its first argument, or through
`SIM_NAME`. Without either, it uses the first booted simulator, falling back
to the first available iPhone in `simctl`'s list. The script installs pods if
the lockfiles differ, starts Metro if needed, then installs and launches the
app. `SCHEME` and `CONFIGURATION` can override its defaults.

For Android, configure the Android SDK and a connected device or emulator,
then start Metro and launch the app from separate terminals:

```bash
yarn start
# In another terminal:
yarn android
```

| Command | Purpose |
| --- | --- |
| `yarn start` | Start Metro |
| `yarn start:clean` | Clear Watchman watches and reset Metro's cache; requires Watchman |
| `yarn type-check` | Run the module-collision checker, then `tsc --noEmit` |
| `yarn check:collisions` | Run only `scripts/check-module-collisions.js` |
| `yarn exec tsc --noEmit` | Run TypeScript directly without the collision checker |
| `yarn lint` / `yarn lint:fix` | Check / fix ESLint issues |
| `yarn format` / `yarn format:check` | Format / check JavaScript and TypeScript under `src/` with Prettier |
| `yarn test` | Run Jest tests |
| `yarn build store` | Build the default Android variant APK (see `build_variant.sh`) |
| `yarn build flavor1` | Build the 9eSIM Android variant APK |

Variant builds apply the requested variant and reapply `store` after a
successful build. They change native files and assets, so review the working
tree afterward. Signing requirements depend on the variant.

### macOS (Mac Catalyst)

```bash
yarn macos
yarn macos:release
yarn macos:logs
```

`scripts/run-macos.sh` builds the iOS target for Mac Catalyst, ad-hoc signs
the app with `ios/NekokoLPA/NekokoLPA.entitlements`, starts Metro if needed,
and launches through LaunchServices. A developer signing certificate is not
required for this local workflow.

Keep the sandbox's `com.apple.security.smartcard` entitlement for
CryptoTokenKit reader access. Launch the app through the script rather than
executing its bundle binary directly, so macOS uses the app's privacy usage
descriptions.

### ML Kit and iOS

`react-native.config.js` excludes ML Kit from iOS autolinking by default
because the bundled frameworks lack arm64 simulator and Mac Catalyst slices.
In this configuration the saved-image QR decoding button is hidden; live
camera scanning remains available. Android retains ML Kit.

To opt in for a physical iOS device build:

```bash
(cd ios && RN_WITH_MLKIT=1 pod install)
```

Keep `RN_WITH_MLKIT=1` set for subsequent React Native autolinking/build
commands that need ML Kit. Reinstall pods without that variable before
returning to an arm64 simulator or Mac Catalyst build.

### Project structure

```text
src/
  app/         App root, navigation, and context providers
  features/    One folder per screen (main, profile, download, settings, ...)
  lpa/         eSIM domain: device adapters, wasm bridge, native modules, types
  shared/      Reusable UI, hooks, storage, theme, and utilities
  store/       Redux store and slices
  data/        Static datasets (PLMN, MCC, profile sizes)
  i18n/        Translations
  assets/      Images and flags
```

Device support is added by implementing the `Device` interface in
`src/lpa/adapters/` and registering it in `src/lpa/deviceManager.ts`.

## Branded variants and third-party builds

The project includes variant configurations for different app identities,
assets, and signing/access requirements. Existing Google Play links:

- [NekokoLPA](https://play.google.com/store/apps/details?id=ee.nekoko.nlpa)
  for [ShiinaSekiu](https://github.com/ShiinaSekiu)'s Community Key.
- [9eSIM](https://play.google.com/store/apps/details?id=ee.nekoko.nlpa.flavor1)
  for [9eSIM removable cards](https://9es.im/).

Other eSIM brands may distribute derived or modified versions of NekokoLPA.
Those third-party modifications are unofficial; we are not affiliated with,
responsible for, or able to provide support for them.

## License

See [`LICENSE`](./LICENSE) for the full terms and disclaimers. The license
permits use, copying, modification, merging, publication, distribution,
sublicensing, and sale, subject to its conditions, including:

> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
