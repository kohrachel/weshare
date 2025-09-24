import { useState } from "react";
import { Text, TextInput } from "react-native";

type InputProps = {
  label?: string;
  defaultValue?: string;
};

export default function Input({ label, defaultValue }: InputProps) {
  const [value, setValue] = useState("");
  return (
    <>
      {label && <Text>{label}:</Text>}
      <TextInput
        className="input-box"
        value={value}
        placeholder={defaultValue ?? ""}
        onChangeText={setValue}
      />
    </>
  );
}
