import React, { useState } from "react";
import { TouchableOpacity, ActivityIndicator, Dimensions, View, Animated, Easing } from "react-native";
import { Text } from "~/components/ui/text";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

interface NavigationButtonsProps {
  handleNext: () => void;
  handleBack: () => void;
  loading: boolean;
  isLastStep: boolean;
  currentStep: number;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  handleNext,
  handleBack,
  loading,
  isLastStep,
  currentStep,
}) => {
  const { width } = Dimensions.get("window");
  const [nextScale] = useState(new Animated.Value(1));
  const [backScale] = useState(new Animated.Value(1));

  const animateButton = (scale: Animated.Value, callback: () => void) => {
    // Trigger haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animate button press
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
    });
  };

  const handleNextPress = () => {
    if (!loading) {
      animateButton(nextScale, handleNext);
    }
  };

  const handleBackPress = () => {
    if (!loading) {
      animateButton(backScale, handleBack);
    }
  };

  return (
    <View className="space-y-3">
      <Animated.View style={{ transform: [{ scale: nextScale }] }}>
        <LinearGradient
          colors={["#fe885a", "#ffb351"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 9999,
            padding: 2,
            width: width - 48,
            alignSelf: "center",
          }}
        >
          <TouchableOpacity
            onPress={handleNextPress}
            disabled={loading}
            activeOpacity={0.8}
            style={{
              borderRadius: 9999,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 16,
              width: "100%",
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-semibold text-center">{isLastStep ? "Complete" : "Next"}</Text>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>

      <View
        style={{
          borderRadius: 9999,
          padding: 2,
          width: width - 48,
          alignSelf: "center",
          marginTop: 8,
        }}
      >
        <Animated.View style={{ transform: [{ scale: backScale }] }}>
          <TouchableOpacity
            onPress={handleBackPress}
            disabled={loading || currentStep === 0}
            activeOpacity={0.8}
            className={`rounded-full border py-4 ${
              currentStep === 0 ? "bg-gray-100 border-gray-200" : "bg-white border-gray-300"
            }`}
          >
            <Text className={`font-semibold text-center ${currentStep === 0 ? "text-gray-400" : "text-gray-700"}`}>
              Back
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};
