import { View, Text, StyleSheet } from 'react-native';

type ContactProps = {
  firstName: string;
  lastName: string;
  phoneNum: number;
  email: string;
};

const Contact: React.FC<ContactProps> = () => {
  return (
    <View style={styles.card}>
      {/* Name Header */}
      <Text style={styles.name}>
        {firstName} {lastName}
      </Text>

      {/* Contact Info */}
      <View style={styles.detailRow}>
        <Text style={styles.label}>Phone: </Text>
        <Text style={styles.value}>{phoneNum}</Text>
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    fontWeight: '600',
    color: '#555',
  },
  value: {
    color: '#333',
  },
  buttonWrapper: {
    marginTop: 16,
    alignItems: 'flex-start',
  },
});

export default ContactCard;