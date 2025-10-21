import { Link } from "expo-router";
import { Image, StyleSheet, View } from "react-native";

export default function Footer() {
  return (
    <View style={styles.footerWrapper}>
      <View style={styles.footerItems}>
        <Link href="/">
          <Image
            source={require("@/assets/images/home.png")}
            style={styles.footerItem}
          />
        </Link>
        <Link href="/search">
          <Image
            source={require("@/assets/images/search.png")}
            style={styles.footerItem}
          />
        </Link>

        <Link href="/editProfile">
          <Image
            source={require("@/assets/images/profile.png")}
            style={styles.footerItem}
          />
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
    height: 80,
    backgroundColor: "#181818",
    paddingHorizontal: 100,
    paddingBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  footerItems: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  footerItem: {
    height: 24,
    width: 24,
  },
});
