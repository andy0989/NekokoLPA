import React, {PropsWithChildren} from 'react';
import {KeyboardAvoidingView, Platform, ScrollView, View, ScrollViewProps} from 'react-native';
import {YStack} from 'tamagui';

interface PageContainerProps {
  /**
   * Additional props for the ScrollView
   */
  scrollViewProps?: ScrollViewProps;
  /**
   * Whether to enable keyboard avoiding (default: true)
   */
  keyboardAvoiding?: boolean;
  /**
   * Extra padding at bottom for content (default: 40)
   */
  bottomPadding?: number;
  /**
   * Horizontal padding (default: 10)
   */
  horizontalPadding?: number;
  /**
   * Top padding (default: 0)
   */
  topPadding?: number;
}

/**
 * PageContainer - Provides consistent padding and keyboard avoidance for pages
 * - Horizontal padding: 10px (configurable)
 * - Vertical padding: scrollable with keyboard avoidance
 * - Extra height at bottom for content
 * - Avoids the keyboard; Screen supplies the safe area
 */
export default function PageContainer({
  children,
  scrollViewProps,
  keyboardAvoiding = true,
  bottomPadding = 40,
  horizontalPadding = 20,
  topPadding = 0,
}: PropsWithChildren<PageContainerProps>) {
  const content = (
    <YStack
      width="100%"
      maxWidth={800}
      alignSelf="center"
      paddingHorizontal={horizontalPadding}
      paddingTop={topPadding}
      paddingBottom={bottomPadding}
      flex={1}>
      {children}
    </YStack>
  );

  if (!keyboardAvoiding) {
    // If scrollEnabled is false, don't use ScrollView - just return the content directly
    if (scrollViewProps?.scrollEnabled === false) {
      return <View style={{flex: 1}}>{content}</View>;
    }
    return (
      <ScrollView
        bounces
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{flexGrow: 1}}
        {...scrollViewProps}>
        {content}
      </ScrollView>
    );
  }

  // If scrollEnabled is false, don't use ScrollView - just return the content with KeyboardAvoidingView
  if (scrollViewProps?.scrollEnabled === false) {
    return (
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <View style={{flex: 1}}>{content}</View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <ScrollView
        bounces
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{flexGrow: 1}}
        keyboardShouldPersistTaps="handled"
        {...scrollViewProps}>
        {content}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
