/**
 Contributors
 Rachel Huiqi: 6 hours
 */

import { formatDate, formatTime } from "../utils/DateTime";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { styles as inputStyles } from "./Input";

type DateTimeInputProps = {
  label?: string;
  value?: string;
  dateValue: Date;
  timeValue: Date;
  setDateValue: React.Dispatch<React.SetStateAction<Date>>;
  setTimeValue: React.Dispatch<React.SetStateAction<Date>>;
  required?: boolean;
};

/**
 * Renders a component for date and time selection.
 * It displays the provided label and two separate, pressable inputs for date and time.
 * Tapping on either input opens the respective native date or time picker.
 * @param {DateTimeInputProps} props - The component props.
 * @param {string} [props.label] - An optional label to display above the input fields.
 * @param {Date} props.dateValue - The current date value.
 * @param {Date} props.timeValue - The current time value.
 * @param {React.Dispatch<React.SetStateAction<Date>>} props.setDateValue - The state dispatch function to update the date.
 * @param {React.Dispatch<React.SetStateAction<Date>>} props.setTimeValue - The state dispatch function to update the time.
 * @param {boolean} [props.required] - If true, displays a red asterisk next to the label to indicate a required field.
 * @returns {JSX.Element} The DateTimeInput component.
 */
export default function DateTimeInput({
  label,
  dateValue,
  timeValue,
  setDateValue,
  setTimeValue,
  required,
}: DateTimeInputProps) {
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  return (
    <View style={inputStyles.inputWrapper}>
      {label && (
        <Text style={inputStyles.inputLabel}>
          {label}
          {required && <Text style={styles.requiredAsterisk}> *</Text>}
        </Text>
      )}

      <View style={styles.dateTimeWrapper}>
        <Picker
          visible={datePickerVisible}
          value={dateValue}
          mode="date"
          setValue={setDateValue}
          setVisible={setDatePickerVisible}
        />
        <Picker
          visible={timePickerVisible}
          value={timeValue}
          mode="time"
          setValue={setTimeValue}
          setVisible={setTimePickerVisible}
        />
      </View>
    </View>
  );
}

type PickerProps = {
  value: Date;
  mode: "date" | "time";
  setValue: (date: Date) => void;
  setVisible: (visible: boolean) => void;
  visible: boolean;
};

function Picker({ value, mode, setValue, visible, setVisible }: PickerProps) {
  return (
    <>
      <Pressable onPress={() => setVisible(true)}>
        <Text style={mode === "date" ? styles.dateBox : styles.timeBox}>
          {mode === "date" ? formatDate(value) : formatTime(value)}
        </Text>
      </Pressable>
      {visible && (
        <RNDateTimePicker
          value={value}
          mode={mode}
          onChange={(_, date) => {
            if (!date) return;
            setValue(date);
            setVisible(false);
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  dateTimeWrapper: {
    flexDirection: "row",
    gap: 20,
    width: "100%",
  },
  dateBox: {
    ...inputStyles.inputBox,
    textAlign: "center",
    width: 120,
  },
  timeBox: {
    ...inputStyles.inputBox,
    textAlign: "center",
    width: 100,
  },
  requiredAsterisk: {
    color: "#ff0000",
  },
});
