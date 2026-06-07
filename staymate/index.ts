import { registerRootComponent } from 'expo';
import { Text, TextInput } from 'react-native';

import App from './App';

// Cap font scaling at 1.3× so accessibility large-text settings don't break layouts.
// allowFontScaling stays true for accessibility compliance.
(Text as any).defaultProps = { ...(Text as any).defaultProps, maxFontSizeMultiplier: 1.3 };
(TextInput as any).defaultProps = { ...(TextInput as any).defaultProps, maxFontSizeMultiplier: 1.3 };

registerRootComponent(App);
