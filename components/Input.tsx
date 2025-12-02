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

/**
 * Renders a customizable text input field with an optional label.
 * This component forwards a ref to the underlying TextInput component, allowing for direct interaction.
 * @param {InputProps} props - The component props.
 * @param {string} [props.label] - An optional label to display above the input field.
 * @param {string} [props.value] - The current value of the input.
 * @param {(text: string) => void} [props.setValue] - A callback function that is called when the text input's text changes.
 * @param {string} [props.defaultValue] - The placeholder text to display when the input is empty.
 * @param {string} [props.testID] - An ID for testing purposes.
 * @param {StyleProp<ViewStyle>} [props.style] - Optional custom styles for the input wrapper.
 * @param {boolean} [props.required] - If true, displays a red asterisk next to the label.
 * @param {() => void} [props.onPress] - An optional callback that is called when the input is pressed.
 * @param {() => void} [props.onBlur] - An optional callback that is called when the input loses focus.
 * @param {React.Ref<TextInput>} ref - The ref forwarded to the TextInput component.
 * @returns {JSX.Element} The Input component.
 */
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
