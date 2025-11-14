/**
 Contributors
 Kevin Song: 3 hours
 Rachel Huiqi: 2 hours
 */

import { UserGenderType } from "@/app/rsvp";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type ContactCardProps = {
  name: string;
  phoneNum: string;
  email: string;
  gender: UserGenderType;
};

const ContactsCard: React.FC<ContactCardProps> = ({
type IconGlyphs = "male" | "female" | "male-female";

  name,
  phoneNum,
  email,
  gender,
}) => {
  const formatPhoneNumber = (phoneNum: string) => {
    if (phoneNum === "Not set") return "Not set";
    return phoneNum.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  };

  const getGenderStyles = (
    gender: UserGenderType,
  ): { icon: IconGlyphs; color: string } => {
    if (gender === "Male") return { icon: "male", color: "#61e3f5" };
    if (gender === "Female") return { icon: "female", color: "#ff8ba0" };
    return { icon: "male-female", color: "#a0fca1" };
  };

  const { icon, color } = getGenderStyles(gender);
  return (
    <View style={styles.card}>
      {/* Name Header */}
      <Text style={styles.name}>{name}</Text>

      {/* Contact Info */}
      <View style={styles.detailRow}>
        <Text style={styles.label}>Phone: </Text>
        <Text style={styles.value}>{formatPhoneNumber(phoneNum)}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Email: </Text>
        <Text style={styles.value}>{email}</Text>
        <Ionicons name={icon} size={24} color={color} />
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Gender: </Text>
        <Text style={styles.value}>{gender}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#333",
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  label: {
    fontWeight: "600",
    color: "#555",
  },
  value: {
    color: "#333",
  },
  buttonWrapper: {
    marginTop: 16,
    alignItems: "flex-start",
  },
});

export default ContactsCard;
