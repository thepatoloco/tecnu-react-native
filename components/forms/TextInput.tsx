import { Control, Controller } from "react-hook-form";
import { View } from "react-native";
import { Input } from "tamagui";

interface TextInputProps {
    control: Control;
    name: string;
    props?: Record<string, any>;
}

export function TextInput({ control, name, props }: TextInputProps) {
    return (
        <View>
            <Controller
                control={control}
                name={name}
                render={({ field }) => (
                    <Input
                        value={field.value}
                        onChangeText={field.onChange}
                        {...props}
                    />
                )}
            />
        </View>
    )
}
