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
  inputLabel: {
    color: "#e7e7e7",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
});
