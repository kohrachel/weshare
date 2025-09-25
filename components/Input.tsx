import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

type InputProps = {
  label?: string;
  defaultValue?: string;
  inputType?: "time";
};

export default function Input({ label, defaultValue, inputType }: InputProps) {
  const [value, setValue] = useState("");
  return (
    <View style={styles.inputWrapper}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      {inputType === "time" ? (
        <View style={styles.inputTimeRow}>
          <TextInput
            style={styles.inputCell}
            value={value}
            placeholder={"Jan"}
            placeholderTextColor="#999"
            onChangeText={setValue}
          />
          <TextInput
            style={styles.inputCell}
            value={value}
            placeholder={"01"}
            placeholderTextColor="#999"
            onChangeText={setValue}
          />
          <TextInput
            style={styles.inputCell}
            value={value}
            placeholder={"2000"}
            placeholderTextColor="#999"
            onChangeText={setValue}
          />
          <TextInput
            style={styles.inputCell}
            value={value}
            placeholder={"8pm"}
            placeholderTextColor="#999"
            onChangeText={setValue}
          />
        </View>
      ) : (
        <TextInput
          style={styles.inputBox}
          value={value}
          placeholder={defaultValue ?? ""}
          placeholderTextColor="#999"
          onChangeText={setValue}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: "column",
    gap: 15,
    width: "100%",
  },
  inputBox: {
    width: "100%",
    height: "auto",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 10,
    outlineColor: "#e7e7e7",
    outlineStyle: "solid",
    outlineWidth: 1,
    color: "#e7e7e7",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  inputLabel: {
    color: "#e7e7e7",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  inputTimeRow: {
    flexDirection: "row",
    gap: 10,
  },
  inputCell: {
    height: "auto",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 10,
    outlineColor: "#e7e7e7",
    outlineStyle: "solid",
    outlineWidth: 1,
    color: "#e7e7e7",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    width: 60,
    textAlign: "center",
  },
});
