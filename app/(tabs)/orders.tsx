import TableSchema from "@/components/TableSchema";
import { Order } from "@/utils/dbTypes";
// import { supabase } from "@/utils/supabase";
import React, { useCallback, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "tamagui";
import { MoreHorizontal, Plus } from "@tamagui/lucide-icons";
import { Link, router, useFocusEffect } from "expo-router";
import { MenuView } from "@react-native-menu/menu";
// import { useToastController } from "@tamagui/toast";

const columns = [
  { name: "Id", id: "id", flex: 1 },
  { name: "Producto", id: "product", flex: 3 },
  { name: "Fecha", id: "created_at", flex: 3 },
  { name: "Más", id: "more", flex: 1 },
];

export default function QuotePage() {
  const { left, right, bottom } = useSafeAreaInsets();
  const [orders, setOrders] = useState<Order[] | null>(null);

  // Function Row Content
  function rowContent(
    row: Record<string, any>,
    key: string,
  ): React.ReactNode | string {
    const content = row[key] as string;

    switch (key) {
      case "more":
        return (
          <MenuView
            // Select the correct function depending on the function activating
            onPressAction={({ nativeEvent }) => {
              switch (nativeEvent.event) {
                case "open":
                  // openClient(row["id"] as number);
                  break;
                case "delete":
                  // removeClient(row["id"] as number);
                  break;
              }
            }}
            actions={[
              {
                id: "open",
                title: "Ver",
                image: Platform.select({
                  ios: "eye.fill",
                  android: "baseline_visibility_20",
                }),
              },
              {
                id: "delete",
                title: "Eliminar",
                attributes: {
                  destructive: true,
                },
                image: Platform.select({
                  ios: "trash",
                  android: "ic_menu_delete",
                }),
              },
            ]}
          >
            <Pressable>
              {({ pressed }) => (
                <MoreHorizontal style={{ opacity: pressed ? 0.5 : 1 }} />
              )}
            </Pressable>
          </MenuView>
        );
      default:
        return content;
    }
  }

  // Colect client list from db
  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        // let { data: clients, error } = await supabase
        //   .from("clients")
        //   .select("*");
        // if (error || !clients) {
        //   console.log("Error cargando datos.");
        //   setClients([]);
        //   return;
        // }
        setOrders(
          [
            {
              id: 1,
              product: "Piston Festo",
              created_at: "13/04/2024",
              updated_at: "13/04/2024",
            },
          ].sort((a, b) => a.id - b.id),
        );
      }
      loadData();
    }, []),
  );

  return (
    <ScrollView
      className="bg-transparent w-full h-full"
      style={{ marginLeft: left, marginRight: right, paddingBottom: bottom }}
    >
      <View className="flex flex-row justify-end p-4 pb-0">
        <Link href="/providers/clients/create" asChild>
          <Button
            icon={<Plus />}
            size={"$3"}
            theme="blue"
            borderWidth={1}
            borderColor="steelblue"
          >
            Nueva Orden
          </Button>
        </Link>
      </View>
      <TableSchema
        columns={columns}
        rows={orders ?? []}
        isLoading={!orders}
        rowsPerPage={10}
        rowContent={rowContent}
      />
    </ScrollView>
  );
}
