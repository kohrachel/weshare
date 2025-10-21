/**
 Contributors
 Rachel Huiqi: 3 hours
 */

import RNDateTimePicker from "@react-native-community/datetimepicker";
import { StyleSheet, Text, View } from "react-native";

type DateTimeInputProps = {
  label?: string;
  value?: string;
  dateValue: Date;
  timeValue: Date;
  setDateValue: React.Dispatch<React.SetStateAction<Date>>;
  setTimeValue: React.Dispatch<React.SetStateAction<Date>>;
};

export default function DateTimeInput({
  label,
  dateValue,
  timeValue,
  setDateValue,
  setTimeValue,
}: DateTimeInputProps) {
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
