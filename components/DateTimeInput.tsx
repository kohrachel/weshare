import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function DateTimeInput({ label }: { label?: string }) {
  const [dateValue, setDateValue] = useState(new Date());
  const [timeValue, setTimeValue] = useState(new Date());

  return (
    <View style={styles.inputWrapper}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}

      <View style={styles.dateTimeCells}>
        <RNDateTimePicker
          value={dateValue}
          mode="date"
          themeVariant="dark"
          onChange={(_, date) => {
            if (!date) return;
            setDateValue(date);
          }}
        />
        <RNDateTimePicker
          value={timeValue}
          mode="time"
          themeVariant="dark"
          onChange={(_, date) => {
            if (!date) return;
            setTimeValue(date);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: "column",
    gap: 15,
    width: "100%",
  },
  dateTimeCells: {
    flexDirection: "row",
    gap: 10,
  },
  inputLabel: {
    color: "#e7e7e7",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
});
