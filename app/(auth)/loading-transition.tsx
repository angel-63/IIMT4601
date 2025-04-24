import { View, Text, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { useAuth } from '../../context/auth';

export default function LoadingTransition() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { completeSignUp } = useAuth();
  const hasNavigated = useRef(false); // Track if navigation has occurred

  useEffect(() => {
    console.log('Starting loading transition animation');
    const animation = Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      })
    ]);

    animation.start(({ finished }) => {
      if (finished && !hasNavigated.current) {
        console.log('Animation completed successfully, calling completeSignUp');
        try {
          hasNavigated.current = true; // Prevent duplicate navigation
          completeSignUp();
          console.log('completeSignUp called successfully');
        } catch (error) {
          console.error('Error in completeSignUp:', error);
        }
      } else if (!finished) {
        console.error('Animation did not complete');
      }
    });

    // Cleanup on unmount
    return () => {
      animation.stop();
      hasNavigated.current = false;
      console.log('Cleaning up loading transition');
    };
  }, [completeSignUp]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
        <Text style={styles.text}>Starting your journey...</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    color: 'white',
    fontWeight: '600',
  },
});