// app/WelcomeScreen.tsx

import React, { useState, useEffect, useRef } from "react";
import { View, Image, Dimensions, TouchableOpacity, ImageSourcePropType } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "~/components/ui/text";

import Carousel from "react-native-reanimated-carousel";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from "react-native-reanimated";
import { SlideOne } from "~/components/welcome/slide-one";
import { SlideTwo } from "~/components/welcome/slide-two";
import { SlideThree } from "~/components/welcome/slide-three";

const { width } = Dimensions.get("window");

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const carouselRef = useRef<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const slides = [<SlideOne />, <SlideTwo />, <SlideThree />];
  const slideCount = slides.length;

  const progressValues = useRef(slides.map(() => useSharedValue(0))).current;

  const goToNextSlide = (prevIndex: number) => {
    const nextIndex = (prevIndex + 1) % slideCount;
    carouselRef.current?.scrollTo({ index: nextIndex, animated: true });
    setCurrentIndex(nextIndex);
  };

  const startSlideTimer = (index: number) => {
    // Reset all progress bars
    progressValues.forEach((val) => (val.value = 0));

    // Animate only the current progress bar
    progressValues[index].value = withTiming(1, { duration: 5000 }, (finished) => {
      if (finished) {
        runOnJS(goToNextSlide)(index);
      }
    });
  };

  useEffect(() => {
    startSlideTimer(currentIndex);
  }, [currentIndex]);

  return (
    <LinearGradient
      colors={["#ffb351", "#fe885a", "#ffa2a3"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
      className="flex-1 justify-between pt-6 pb-6 px-6"
    >
      {/* Logo */}
      <View className="my-8 items-center">
        <Image
          source={require("../assets/images/logo/white/logo-white-1.png") as ImageSourcePropType}
          className="w-16 h-16"
          resizeMode="contain"
        />
      </View>

      {/* Progress Bar */}
      <View className="flex-row justify-center mb-6">
        {slides.map((_, i) => {
          const animatedStyle = useAnimatedStyle(() => {
            return {
              width: `${progressValues[i].value * 100}%`,
            };
          });

          return (
            <View key={i} className="w-6 h-1 mr-2 rounded-full overflow-hidden bg-white/20">
              <Animated.View className="h-full bg-white" style={animatedStyle} />
            </View>
          );
        })}
      </View>

      {/* Carousel */}
      <Carousel
        ref={carouselRef}
        loop={false}
        width={width}
        height={500}
        data={slides}
        onSnapToItem={(index) => setCurrentIndex(index)}
        renderItem={({ item }) => <View className="flex justify-center items-center w-full px-4">{item}</View>}
      />

      {/* Divider with OR */}
      <View
        className="flex flex-row items-center mx-8 absolute bottom-24 left-0 right-0"
        style={{ width: width - 48, alignSelf: "center" }}
      >
        <View className="flex h-[1px] flex-1 bg-white/50" />
        <Text className="mx-3 text-white/80">or</Text>
        <View className="flex h-[1px] flex-1 bg-white/50" />
      </View>

      {/* Sign In button */}
      <TouchableOpacity
        className="bg-white rounded-full py-4 items-center mx-8 absolute bottom-16 left-0 right-0"
        style={{ width: width - 48, alignSelf: "center" }}
        onPress={() => router.push("/signIn")}
      >
        <Text className="text-orange-400 text-lg font-semibold">Sign In</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}
