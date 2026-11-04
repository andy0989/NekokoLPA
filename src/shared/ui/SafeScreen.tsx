import {StatusBar} from 'react-native';
import React, {PropsWithChildren} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useColorScheme} from '@/app/providers/ThemeProvider';
import {YStack} from 'tamagui';

function SafeScreen({children}: PropsWithChildren) {
  const {scheme} = useColorScheme();
  const insets = useSafeAreaInsets();
  return (
    <YStack
      backgroundColor="$background"
      paddingTop={insets.top}
      paddingBottom={insets.bottom}
      paddingLeft={insets.left}
      paddingRight={insets.right}
      flex={1}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} />
      {children}
    </YStack>
  );
}

export default SafeScreen;
