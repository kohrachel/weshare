/**
 Contributors
 Kevin Song: 3 hours
 Rachel Huiqi: 3 hours
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
      <View style={styles.nameRow}>
        <Text style={styles.name}>{name}</Text>
        <Ionicons name={icon} size={24} color={color} />
      </View>

      {/* Contact Info */}
      <View style={styles.detailRow}>
        <Text style={styles.value}>☎️ {formatPhoneNumber(phoneNum)}</Text>
        <Text style={styles.value}>📬 {email}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#2D2D2D",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#4c4c4c",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f0f0f0",
  },
  detailRow: {
    flexDirection: "column",
    marginBottom: 6,
    gap: 4,
  },
  label: {
    fontWeight: "600",
    color: "#f0f0f0",
  },
  value: {
    color: "#ececec",
  },
});

export default ContactsCard;
