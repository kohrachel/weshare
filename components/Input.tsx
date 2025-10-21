/**
 Contributors
 Rachel Huiqi: 3 hours
 */

import { StyleSheet, Text, TextInput, View } from "react-native";

type InputProps = {
  label?: string;
  value?: string;
  setValue?: (text: string) => void;
  defaultValue?: string;
  inputType?: "time";
};

export default function Input({ label, value, setValue, defaultValue, inputType }: InputProps) {
  return (
    <View style={styles.inputWrapper}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <TextInput
        value={value}
        placeholder={defaultValue ?? ""}
        onChangeText={setValue}
      />
    </View>
  );
}

});
