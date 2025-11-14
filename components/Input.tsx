/**
 Contributors
 Rachel Huiqi: 3 hours
 Jonny Yang: 5 min
*/

import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";

type InputProps = {
  label?: string;
  value?: string;
  setValue?: (text: string) => void;
  defaultValue?: string;
  testID?: string; // <-- add testID prop
  style?: StyleProp<ViewStyle>;
};

export default function Input({
  label,
  value,
  setValue,
  defaultValue,
  testID,
  style,
}: InputProps) {
  return (
    <View style={[styles.inputWrapper, style]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <TextInput
        style={styles.inputBox}
        value={value}
        placeholder={defaultValue ?? ""}
        placeholderTextColor="#999"
        onChangeText={setValue}
        testID={testID} // <-- forward testID
      />
    </View>
  );
}

export const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: "column",
    gap: 15,
    width: "100%",
  },
  inputBox: {
    width: "100%",
    height: "auto",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 13,
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
