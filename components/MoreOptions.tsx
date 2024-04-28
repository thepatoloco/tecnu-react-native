import { MenuAction, MenuView } from "@react-native-menu/menu";
import { MoreHorizontal } from "@tamagui/lucide-icons";
import { Pressable } from "react-native";


interface MoreOptionsProps {
    actions: (MenuAction & { method: () => void })[]
}

export default function MoreOptions({ actions }: MoreOptionsProps) {
    return (
        <MenuView
            actions={actions}
            onPressAction={({ nativeEvent }) => {
                for (const act of actions){
                    if (nativeEvent.event === act.id) {
                        act.method();
                        break;
                    }
                }
            }}
        >
            <Pressable>
              {({ pressed }) => (
                <MoreHorizontal style={{ opacity: pressed ? 0.5 : 1 }} />
              )}
            </Pressable>
        </MenuView>
    )
}
