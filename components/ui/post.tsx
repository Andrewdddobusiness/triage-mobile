import React from "react";
import { View, Image, Pressable } from "react-native";
import { Text } from "./text";
import { Input } from "./input";
import { Heart, Share2, MessageCircle } from "lucide-react-native";

interface PostProps {
  username: string;
  title: string;
  description: string;
  imageUrl?: string;
  profileImage?: string;
  likes: number;
  comments: number;
  onLike?: () => void;
  onShare?: () => void;
  onComment?: (text: string) => void;
}

export function Post({
  username,
  title,
  description,
  imageUrl,
  profileImage = "https://ui-avatars.com/api/?name=" + username,
  likes,
  comments,
  onLike,
  onShare,
  onComment,
}: PostProps) {
  const [isLiked, setIsLiked] = React.useState(false);
  const [showCommentInput, setShowCommentInput] = React.useState(false);

  return (
    <View className="bg-white rounded-lg overflow-hidden">
      {/* Content */}
      <View className="p-4">
        <Text className="text-lg font-semibold mb-2">{title}</Text>
        <Text className="text-muted-foreground mb-3">{description}</Text>

        {/* User info */}
        <View className="flex-row items-center gap-2">
          <Image source={{ uri: profileImage }} className="w-6 h-6 rounded-full" />
          <Text className="text-sm text-muted-foreground">{username}</Text>
        </View>
      </View>

      {/* Image */}
      {imageUrl && <Image source={{ uri: imageUrl }} className="w-full h-64" resizeMode="cover" />}

      {/* Actions */}
      <View className="p-4 flex-row items-center gap-6 ">
        <Pressable
          onPress={() => {
            setIsLiked(!isLiked);
            onLike?.();
          }}
          className="flex-row items-center gap-2"
        >
          <Heart size={20} color={isLiked ? "#ef4444" : "#64748b"} fill={isLiked ? "#ef4444" : "none"} />
          <Text className="text-muted-foreground">{likes}</Text>
        </Pressable>

        <Pressable onPress={() => setShowCommentInput(!showCommentInput)} className="flex-row items-center gap-2">
          <MessageCircle size={20} color="#64748b" />
          <Text className="text-muted-foreground">{comments}</Text>
        </Pressable>

        <Pressable onPress={onShare} className="flex-row items-center gap-2">
          <Share2 size={20} color="#64748b" />
        </Pressable>
      </View>

      {/* Comment Input */}
      {showCommentInput && (
        <View className="px-4 pb-4">
          <Input
            placeholder="Write a comment..."
            onSubmitEditing={(e) => onComment?.(e.nativeEvent.text)}
            returnKeyType="send"
            className="text-sm"
          />
        </View>
      )}
    </View>
  );
}
