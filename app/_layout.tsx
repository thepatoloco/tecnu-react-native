import "@tamagui/core/reset.css";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { useColorScheme } from "@/components/useColorScheme";
import { TamaguiProvider } from "tamagui";
import { ToastProvider, ToastViewport } from "@tamagui/toast";
import tamaguiConfig from "@/tamagui.config";
import CurrentToast from "@/components/CurrentToast";
import { useSafeArea } from "react-native-safe-area-context";

declare module "@tamagui/toast" {
  interface CustomData {
    toastType: "error" | "success" | "warning";
  }
}

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { left, top, right } = useSafeArea();

  return (
    <TamaguiProvider config={tamaguiConfig}>
      <ToastProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="providers/clients/create"
              options={{ title: "Crear Cliente", presentation: "modal" }}
            />
            <Stack.Screen
              name="providers/clients/[id]/read"
              options={{ title: "Cliente", headerBackTitle: "Volver" }}
            />
            <Stack.Screen
              name="providers/clients/[id]/locations/create"
              options={{ title: "Crear Ubicación", presentation: "modal" }}
            />
            <Stack.Screen
              name="providers/products/create"
              options={{ title: "Crear Producto", presentation: "modal" }}
            />
            <Stack.Screen
              name="providers/products/[id]"
              options={{ title: "Producto", headerBackTitle: "Volver" }}
            />
            <Stack.Screen
              name="providers/sales/create"
              options={{ title: "Crear Venta", presentation: "modal" }}
            />
            <Stack.Screen
              name="providers/quotes/create"
              options={{ title: "Crear Cotización", presentation: "modal" }}
            />
          </Stack>

          <CurrentToast />
          <ToastViewport left={left} right={right} top={top} />
        </ThemeProvider>
      </ToastProvider>
    </TamaguiProvider>
  );
}
