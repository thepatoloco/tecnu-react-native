import { supabase } from "@/utils/supabase";
import { CircleUserRound } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Sheet } from "tamagui";

export default function LogoutButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { left, right, bottom } = useSafeAreaInsets();

    async function LogOut() {
        setIsLoading(true);
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.log("Logout error:", error);
            setIsLoading(false);
            return;
        }

        setIsOpen(false);
        setIsLoading(false);
        router.push('/')
    }

    return (
        <View>
            <Pressable onPress={() => setIsOpen(true)} className='ml-2'>
                {({ pressed }) => (
                    <CircleUserRound
                        style={{ opacity: pressed ? 0.5 : 1 }}
                    />
                )}
            </Pressable>
            <Sheet
                open={isOpen}
                onOpenChange={setIsOpen}
                modal={true}
                snapPointsMode='fit'
                dismissOnOverlayPress={!isLoading}
                
            >
                <Sheet.Overlay/>
                <Sheet.Handle />
                <Sheet.Frame style={{ paddingBottom: bottom, paddingLeft: left, paddingRight: right }}>
                    <Button onPress={() => LogOut()} theme="red" className='m-4'>Cerrar Sesión</Button>
                </Sheet.Frame>
            </Sheet>
        </View>
    )
}
