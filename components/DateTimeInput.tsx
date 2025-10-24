/**
 Contributors
 Rachel Huiqi: 3 hours
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
        <Pressable onPress={() => setDatePickerVisible(true)}>
          <Text style={styles.dateTimeBox}>
            {dateValue.toLocaleDateString()}
          </Text>
        </Pressable>
        {datePickerVisible && (
          <RNDateTimePicker
            value={dateValue}
            mode="date"
            themeVariant="dark"
            onChange={(_, date) => {
              if (!date) return;
              setDateValue(date);
            }}
          />
        )}
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

type PickerProps = {
  value: Date;
  mode: "date" | "time";
  setValue: (date: Date) => void;
  setVisible: (visible: boolean) => void;
};

function Picker({ value, mode, setValue, setVisible }: PickerProps) {
  return (
    <RNDateTimePicker
      value={value}
      mode={mode}
      onChange={(_, date) => {
        if (!date) return;
        console.log({ date });
        setValue(date);
        setVisible(false);
      }}
    />
  );
}

const styles = StyleSheet.create({
  dateTimeWrapper: {
    flexDirection: "row",
    gap: 20,
    width: "100%",
  },
  dateTimeBox: {
    ...inputStyles.inputBox,
    textAlign: "center",
  },
});
