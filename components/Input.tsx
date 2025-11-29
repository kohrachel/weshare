/**
 Contributors
 Rachel Huiqi: 3 hours
 Jonny Yang: 5 min
*/

import React, { forwardRef } from "react";
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
  testID?: string;
  style?: StyleProp<ViewStyle>;
  required?: boolean;
  onPress?: () => void;
  onBlur?: () => void;
};

const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      value,
      setValue,
      defaultValue,
      testID,
      style,
      required,
      onPress,
      onBlur,
    },
    ref,
  ) => {
    return (
      <View style={[styles.inputWrapper, style]}>
        {label && (
          <Text style={styles.inputLabel}>
            {label}
            {required && <Text style={styles.requiredAsterisk}> *</Text>}
          </Text>
        )}
        <TextInput
          ref={ref}
          style={styles.inputBox}
          value={value}
          placeholder={defaultValue ?? ""}
          placeholderTextColor="#999"
          onChangeText={setValue}
          testID={testID}
          onPress={onPress}
          onBlur={onBlur}
        />
      </View>
    );
  },
);

Input.displayName = "Input";

export default Input;

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
  requiredAsterisk: {
    color: "#ff0000",
  },
});
