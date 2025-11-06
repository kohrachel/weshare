/**
 Contributors
 Rachel Huiqi: 6 hours
 */

import { formatDate, formatTime } from "@/utils";
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
};

export default function DateTimeInput({
  label,
  dateValue,
  timeValue,
  setDateValue,
  setTimeValue,
}: DateTimeInputProps) {
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  return (
    <View style={inputStyles.inputWrapper}>
      {label && <Text style={inputStyles.inputLabel}>{label}</Text>}

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
});
