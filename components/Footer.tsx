/**
 Contributors
 Rachel Huiqi: 2 hours
 */

import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function Footer() {
  return (
    <View style={styles.footerWrapper}>
      <View style={styles.footerItems}>
        <Link href="/feedPage" style={styles.footerLink}>
          <View style={styles.iconContainer}>
            <Ionicons name="home-outline" size={28} color="#4CAF50" />
            <Text style={styles.iconLabel}>Home</Text>
          </View>
        </Link>

        <Link href="/feedPage?focusSearch=true" style={styles.footerLink}>
          <View style={styles.iconContainer}>
            <Ionicons name="search-outline" size={28} color="#4CAF50" />
            <Text style={styles.iconLabel}>Search</Text>
          </View>
        </Link>

        <Link href="/editProfile" style={styles.footerLink}>
          <View style={styles.iconContainer}>
            <Ionicons name="person-outline" size={28} color="#4CAF50" />
            <Text style={styles.iconLabel}>Profile</Text>
          </View>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: "#181818",
    paddingHorizontal: 100,
    paddingBottom: 30,
    paddingTop: 10,
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
  },
  footerItems: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  footerLink: {
    alignItems: "center",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  iconLabel: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
});
