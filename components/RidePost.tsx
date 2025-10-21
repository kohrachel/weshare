import { View, Text, StyleSheet } from 'react-native';
import { ButtonGreen } from './button-green';

type RidePostProps = {
  firstName: string;
  lastName: string;
  destination: string;
  departureDate: Date;
  departureTime: Date;
  currentPeople: number;
  maxPeople: number;
};

const RidePost: React.FC<RidePostProps> = ({
  firstName,
  lastName,
  destination,
  departureDate,
  departureTime,
  currentPeople,
  maxPeople,
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <View style={styles.card}>
      {/* Name Header */}
      <Text style={styles.name}>
        {firstName} {lastName}
      </Text>

      {/* Ride Details */}
      <View style={styles.detailRow}>
        <Text style={styles.label}>Destination: </Text>
        <Text style={styles.value}>{destination}</Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Departure: </Text>
        <Text style={styles.value}>
          {formatDate(departureDate ?? new Date()) +
            " " +
            formatTime(departureTime ?? new Date())}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.label}>Seats: </Text>
        <Text style={styles.value}>
          {currentPeople} / {maxPeople}
        </Text>
      </View>

      {/* RSVP Button */}
      <View style={styles.buttonWrapper}>
        <ButtonGreen title="RSVP" onPress={() => console.log("RSVP pressed!")} />
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

export default RidePost;