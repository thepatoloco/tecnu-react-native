import TableSchema from "@/components/TableSchema";
import { Client, Product, Sale } from "@/utils/dbTypes";
import { supabase } from "@/utils/supabase";
import React, { useCallback, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "tamagui";
import { MoreHorizontal, Plus } from "@tamagui/lucide-icons";
import { Link, router, useFocusEffect } from "expo-router";
import { MenuView } from "@react-native-menu/menu";
import MoreOptions from "@/components/MoreOptions";
// import { useToastController } from "@tamagui/toast";

const columns = [
  { name: "Id", id: "id", flex: 1 },
  { name: "Cliente", id: "client", flex: 3 },
  { name: "Fecha", id: "created_at", flex: 3 },
  { name: "Más", id: "more", flex: 1 },
];

export default function SalesPage() {
  const { left, right, bottom } = useSafeAreaInsets();
  const [sales, setSales] = useState<Sale[] | null>(null);

  // Function Row Content
  function rowContent(
    row: Record<string, any>,
    key: string,
  ): React.ReactNode | string {
    const content = row[key] as string;

    switch (key) {
      case "client":
        const client = row["client"] as Client;
        return client ? `${client.name} ${client.last_name}` : "";
      case "more":
        return (
          <MoreOptions
            actions={[
              {
                id: "open",
                title: "Ver",
                image: Platform.select({
                  ios: "eye.fill",
                  android: "baseline_visibility_20",
                }),
                method: () => console.log("open")
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
                method: () => console.log("delete")
              },
            ]}
          />
        );
      default:
        return content;
    }
  }

  // Colect client list from db
  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        let { data: sales, error } = await supabase
          .from("sales")
          .select(`*, client(*)`);
        if (error || !sales) {
          console.log("Error cargando datos.");
          setSales([]);
          return;
        }
        setSales(sales);
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
        <Link href="/providers/sales/create" asChild>
          <Button
            icon={<Plus />}
            size={"$3"}
            theme="blue"
            borderWidth={1}
            borderColor="steelblue"
          >
            Nueva Venta
          </Button>
        </Link>
      </View>
      <TableSchema
        columns={columns}
        rows={sales ?? []}
        isLoading={!sales}
        rowsPerPage={10}
        rowContent={rowContent}
      />
    </ScrollView>
  );
}
