/**
 Contributors
 Rachel Huiqi: 3 hours
 */

import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function DateTimeInput({ label }: { label?: string }) {
  const [dateValue, setDateValue] = useState(new Date());
  const [timeValue, setTimeValue] = useState(new Date());

  return (
        <RNDateTimePicker
          value={dateValue}
          mode="date"
          onChange={(_, date) => {
            if (!date) return;
            setDateValue(date);
          }}
        />
        <RNDateTimePicker
          value={timeValue}
          mode="time"
          onChange={(_, date) => {
            if (!date) return;
            setTimeValue(date);
          }}
        />
      </View>
    </View>
  );
}

});
