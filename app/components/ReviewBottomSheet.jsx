import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Dimensions,
} from "react-native";
import StarRating from "./StarRating";
import { getReviews, submitReview } from "../../lib/api";
import { auth } from "../../lib/firebase";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function ReviewBottomSheet({
  fountain,
  visible,
  onClose,
  onRatingUpdated,
}) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myText, setMyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    if (!fountain) {
      return;
    }
    setLoading(true);
    try {
      const data = await getReviews(fountain._id);
      setReviews(data);

      const user = auth.currentUser;
      if (user) {
        const mine = data.find((r) => r.userId === user.uid);
        if (mine) {
          setMyRating(mine.rating);
          setMyText(mine.text || "");
        } else {
          setMyRating(0);
          setMyText("");
        }
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [fountain]);

  useEffect(() => {
    if (visible) fetchReviews();
  }, [visible, fetchReviews]);

  const handleSubmit = async () => {
    if (myRating === 0) {
      return;
    }
    const user = auth.currentUser;
    if (!user) {
      return;
    }

    setSubmitting(true);
    try {
      let displayName = "Anonymous";
      if (user.displayName) {
        displayName = user.displayName;
      } else if (user.email) {
        displayName = user.email.split("@")[0];
      }

      const result = await submitReview(fountain._id, {
        userId: user.uid,
        displayName: displayName,
        rating: myRating,
        text: myText.trim(),
      });

      if (onRatingUpdated) {
        onRatingUpdated(fountain._id, result.avgRating, result.reviewCount);
      }

      await fetchReviews();
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) {
      return "??";
    }
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(item.displayName)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.reviewerName}>{item.displayName}</Text>
          <StarRating rating={item.rating} size={14} />
        </View>
      </View>
      {item.text ? <Text style={styles.reviewText}>{item.text}</Text> : null}
    </View>
  );

  if (!fountain) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={onClose}
          activeOpacity={1}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.sheet}
        >
          <View style={styles.handleRow}>
            <View style={styles.handle} />
          </View>
          <View style={styles.header}>
            <Text style={styles.fountainName}>{fountain.name}</Text>
            {fountain.description ? (
              <Text style={styles.fountainDesc}>{fountain.description}</Text>
            ) : null}
            <View style={styles.aggRow}>
              <StarRating rating={fountain.avgRating || 0} size={28} />
              <Text style={styles.aggText}>
                {(fountain.avgRating || 0).toFixed(1)} (
                {fountain.reviewCount || 0}{" "}
                {fountain.reviewCount === 1 ? "review" : "reviews"})
              </Text>
            </View>
          </View>
          {loading ? (
            <ActivityIndicator style={{ marginVertical: 20 }} color="#48CAE4" />
          ) : reviews.length === 0 ? (
            <Text style={styles.emptyText}>No reviews yet. Be the first!</Text>
          ) : (
            <FlatList
              data={reviews}
              keyExtractor={(item) => item._id}
              renderItem={renderReview}
              style={styles.list}
              contentContainerStyle={{ paddingBottom: 10 }}
            />
          )}
          <View style={styles.addSection}>
            <Text style={styles.addLabel}>Your Rating</Text>
            <StarRating
              rating={myRating}
              size={32}
              interactive
              onRate={setMyRating}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Write a review (optional)"
              placeholderTextColor="#999"
              value={myText}
              onChangeText={setMyText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.submitBtn,
                myRating === 0 && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={myRating === 0 || submitting}
              activeOpacity={0.7}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitText}>Submit Review</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.75,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 10,
  },
  handleRow: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 6,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ccc",
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  fountainName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#023E8A",
  },
  fountainDesc: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  aggRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  aggText: {
    fontSize: 15,
    color: "#333",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginVertical: 24,
    fontSize: 15,
  },
  list: {
    flexGrow: 0,
    maxHeight: SCREEN_HEIGHT * 0.28,
    paddingHorizontal: 20,
  },
  reviewCard: {
    backgroundColor: "#CAF0F8",
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#90E0EF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontWeight: "700",
    fontSize: 14,
    color: "#023E8A",
  },
  reviewerName: {
    fontWeight: "600",
    fontSize: 14,
    color: "#023E8A",
  },
  reviewText: {
    marginTop: 8,
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  addSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  addLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#023E8A",
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    fontSize: 14,
    maxHeight: 80,
    color: "#333",
  },
  submitBtn: {
    backgroundColor: "#48CAE4",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 12,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
