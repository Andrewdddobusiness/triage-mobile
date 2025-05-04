import React from "react";
import { View } from "react-native";
import { MessageSquare, Phone, Users, Grip, CircleUserRound, Calendar, DollarSign, Inbox } from "lucide-react-native";

export const InboxIcon = ({ size = 24, color = "#000" }) => <Inbox size={size} color={color} />;

export const ContactsIcon = ({ size = 24, color = "#000" }) => <Users size={size} color={color} />;

export const KeypadIcon = ({ size = 24, color = "#000" }) => <Grip size={size} color={color} />;

export const CallsIcon = ({ size = 24, color = "#000" }) => <Phone size={size} color={color} />;

export const ProfileIcon = ({ size = 24, color = "#000" }) => <CircleUserRound size={size} color={color} />;

export const CalendarIcon = ({ size = 24, color = "#000" }) => <Calendar size={size} color={color} />;

export const BudgetIcon = ({ size = 24, color = "#000" }) => <DollarSign size={size} color={color} />;

// Inquiry icon with background
export const InquiryIcon = ({ size = 24, color = "#000", bgColor = "#f1f5f9" }) => (
  <View
    style={{
      width: size,
      height: size,
      backgroundColor: bgColor,
      borderRadius: 4,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <MessageSquare size={size * 0.6} color={color} />
  </View>
);
