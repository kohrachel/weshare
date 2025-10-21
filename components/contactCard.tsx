/**
 Contributors
 Kevin Song: 3 hours
 */

import { StyleSheet, Text, View } from "react-native";

type ContactCardProps = {
  firstName: string;
  lastName: string;
  phoneNum: number;
  email: string;
};

const ContactsCard: React.FC<ContactCardProps> = ({
  firstName,
  lastName,
  phoneNum,
  email,
}) => {
  return (
      <Text style={styles.name}>
        {firstName} {lastName}
      </Text>

        <Text style={styles.value}>{phoneNum}</Text>

        <Text style={styles.value}>{email}</Text>
  );
};

export default ContactsCard;