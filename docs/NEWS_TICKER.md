# NewsTicker Component

The `NewsTicker` component displays a horizontally scrolling marquee of recent newsflash headlines in the main feed.

## Dependencies

The ticker is powered by:

- **[@animatereactnative/marquee](https://github.com/animate-react-native/marquee)** - Marquee component for smooth infinite scrolling
- **react-native-reanimated** - Animation library (runs on UI thread for 60-120fps)
- **react-native-worklets** - Required peer dependency for Reanimated

## Usage

```tsx
import NewsTicker from '../components/NewsTicker';

<NewsTicker newsflashes={newsflashes} />
```

The component accepts a `newsflashes` array and automatically:
- Filters to headlines with content
- Takes the top 5 most recent
- Formats with username and BREAKING indicator (🔴)
- Joins with bullet separators

## Accessibility

**Reduce Motion Support**: When the user has "Reduce Motion" enabled in device settings, the marquee animation is disabled and a static (non-scrolling) text is shown instead.

## Tuning

You can adjust these props in `NewsTicker.tsx`:

| Prop | Default | Description |
|------|---------|-------------|
| `speed` | `1` | Animation speed multiplier (lower = slower) |
| `spacing` | `40` | Pixel gap between repeated text cycles |
| `direction` | `"horizontal"` | Scroll direction |

## Troubleshooting

### Animation not working after install

Clear the Metro bundler cache:

```bash
npx expo start -c
```

### Remote debugging issues

React Native Reanimated is incompatible with remote JS debugging. Use Hermes + the JS Inspector instead.

### Build errors

Ensure you have the Reanimated Babel plugin configured. For Expo SDK 54+, this is automatic via `babel-preset-expo`. If you have a custom `babel.config.js`, add:

```js
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    // ... other plugins
    'react-native-reanimated/plugin', // MUST BE LAST
  ],
};
```
