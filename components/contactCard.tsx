/**
 Contributors
 Kevin Song: 3 hours
 Rachel Huiqi: 0.5 hours
 */

import { StyleSheet, Text, View } from "react-native";

type ContactCardProps = {
  firstName: string;
  lastName: string;
  phoneNum: string;
  email: string;
};

const ContactsCard: React.FC<ContactCardProps> = ({
  firstName,
  lastName,
  phoneNum,
  email,
}) => {
  const formatPhoneNumber = (phoneNum: string) => {
    if (phoneNum === "Not set") return "Not set";
    return phoneNum.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  };
  return (
    <View style={styles.card}>
      {/* Name Header */}
      <Text style={styles.name}>
        {firstName} {lastName}
      </Text>

      {/* Contact Info */}
      <View style={styles.detailRow}>
        <Text style={styles.label}>Phone: </Text>
        <Text style={styles.value}>{formatPhoneNumber(phoneNum)}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Email: </Text>
        <Text style={styles.value}>{email}</Text>
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
