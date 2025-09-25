import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

type InputProps = {
  label?: string;
  defaultValue?: string;
};

export default function Input({ label, defaultValue }: InputProps) {
  const [value, setValue] = useState("");
  return (
      <TextInput
        className="input-box"
        value={value}
        placeholder={defaultValue ?? ""}
        onChangeText={setValue}
      />
    <View style={styles.inputWrapper}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
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
});
