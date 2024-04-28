import { Toast, useToastState } from "@tamagui/toast";
import { SafeAreaView } from "react-native-safe-area-context";
import { YStack } from "tamagui";

export default function CurrentToast() {
    const currentToast = useToastState();

    if (!currentToast || currentToast.isHandledNatively) return null
    const theme = () => {
        switch(currentToast.toastType) {
            case 'success': return 'blue';
            case 'warning': return 'yellow';
            case 'error': return 'red'
        }
    };
    return (
        <Toast
            key={currentToast.id}
            duration={currentToast.duration}
            enterStyle={{ opacity: 0, scale: 0.5, y: -25 }}
            exitStyle={{ opacity: 0, scale: 1, y: -20 }}
            y={0}
            opacity={1}
            scale={1}
            animation="100ms"
            viewportName={currentToast.viewportName}
            theme={theme()}
        >
            <YStack>
            <Toast.Title>{currentToast.title}</Toast.Title>
                {!!currentToast.message && (
                    <Toast.Description>{currentToast.message}</Toast.Description>
                )}
            </YStack>
        </Toast>
    )
  }
  
