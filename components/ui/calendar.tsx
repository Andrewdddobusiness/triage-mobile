import React from "react";
import { View, ScrollView, Pressable, Dimensions } from "react-native";
import { Text } from "./text";
import {
  format,
  eachDayOfInterval,
  startOfWeek,
  addWeeks,
  isSameDay,
  eachHourOfInterval,
  startOfDay,
  endOfDay,
} from "date-fns";

interface CalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  events?: { date: Date }[];
}

function TimeGrid() {
  const hours = eachHourOfInterval({
    start: startOfDay(new Date()),
    end: endOfDay(new Date()),
  });

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
      {hours.map((hour) => (
        <View key={hour.toString()} className="flex-row">
          {/* Time label */}
          <View className="w-16 pr-2 py-6">
            <Text className="text-xs text-muted-foreground text-right">{format(hour, "h a")}</Text>
          </View>

          {/* Grid line */}
          <View className="flex-1 border-t border-border" />
        </View>
      ))}
    </ScrollView>
  );
}

export function Calendar({ selectedDate, onSelectDate, events = [] }: CalendarProps) {
  const [weekOffset, setWeekOffset] = React.useState(0);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const screenWidth = Dimensions.get("window").width;

  // Get dates for 3 weeks
  const dates = React.useMemo(() => {
    const start = startOfWeek(addWeeks(new Date(), weekOffset - 1));
    return eachDayOfInterval({
      start,
      end: addWeeks(start, 3),
    });
  }, [weekOffset]);

  const hasEvents = (date: Date) => {
    return events.some((event) => isSameDay(new Date(event.date), date));
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollTo({ x: screenWidth, animated: false });
    }, 50);
    return () => clearTimeout(timer);
  }, [weekOffset, screenWidth]);

  const onScrollEnd = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const weekWidth = screenWidth;
    const currentWeek = Math.round(contentOffset / weekWidth);

    if (currentWeek !== 1) {
      requestAnimationFrame(() => {
        setWeekOffset((prev) => prev + (currentWeek - 1));
      });
    }
  };

  return (
    <View className="flex-1">
      <View className="border-b border-border">
        {/* Month and Year */}
        <View className="px-4 py-2">
          <Text className="text-lg font-medium">{format(dates[7], "MMMM yyyy")}</Text>
        </View>

        {/* Calendar Grid */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScrollEndDrag={onScrollEnd}
          contentOffset={{ x: screenWidth, y: 0 }}
        >
          {[0, 1, 2].map((weekIdx) => (
            <View key={weekIdx} style={{ width: screenWidth }} className="flex-row justify-between px-4">
              {dates.slice(weekIdx * 7, (weekIdx + 1) * 7).map((date) => (
                <Pressable
                  key={date.toISOString()}
                  onPress={() => onSelectDate(date)}
                  className={`items-center px-3 py-2 rounded-lg ${
                    isSameDay(date, selectedDate) ? "bg-primary/10" : ""
                  }`}
                >
                  <Text className="text-sm text-muted-foreground">{format(date, "EEE")}</Text>
                  <Text className={`text-lg font-medium ${isSameDay(date, selectedDate) ? "text-primary" : ""}`}>
                    {format(date, "d")}
                  </Text>
                  {hasEvents(date) && <View className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />}
                </Pressable>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Time Grid */}
      <View className="flex-1">
        <TimeGrid />
      </View>
    </View>
  );
}
