import { Button } from 'react-native';

interface ButtonGreenProps {
  title: string;
  onPress: () => void;
}

export function ButtonGreen({ title, onPress }: ButtonGreenProps) {
  return (
    <Button
        title={title}
        color="#529053"
        onPress={onPress}
    />
  );
}
