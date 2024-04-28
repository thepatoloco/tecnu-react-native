import { Tabs } from "expo-router";
import { FileBox, Users, Package, DollarSign, BookOpen } from '@tamagui/lucide-icons'
import { useColorScheme } from "react-native";
import LogoutButton from "@/components/LogoutButton";

export default function TabsLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs>
            <Tabs.Screen
                name="products"
                options={{
                    title: 'Productos',
                    tabBarIcon: ({ color }) => <FileBox color={color}/>,
                    headerLeft: () => <LogoutButton />
                }}
            />
            <Tabs.Screen
                name="clients"
                options={{
                    title: 'Clientes',
                    tabBarIcon: ({ color }) => <Users color={color}/>,
                    headerLeft: () => <LogoutButton />
                }}
            />
            <Tabs.Screen
                name="orders"
                options={{
                    title: 'Ordenes',
                    tabBarIcon: ({ color }) => <Package color={color}/>,
                    headerLeft: () => <LogoutButton />
                }}
            />
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Ventas',
                    tabBarIcon: ({ color }) => <DollarSign color={color}/>,
                    headerLeft: () => <LogoutButton />
                }}
            />
            <Tabs.Screen
                name="quotes"
                options={{
                    title: 'Cotizaciones',
                    tabBarIcon: ({ color }) => <BookOpen color={color}/>,
                    headerLeft: () => <LogoutButton />
                }}
            />
        </Tabs>
    )
}
