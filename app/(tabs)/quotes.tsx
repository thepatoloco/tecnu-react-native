import TableSchema from "@/components/TableSchema";
import { Client, Product, Sale } from "@/utils/dbTypes";
// import { supabase } from "@/utils/supabase";
import React, { useCallback, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "tamagui";
import { MoreHorizontal, Plus } from "@tamagui/lucide-icons";
import { Link, router, useFocusEffect } from "expo-router";
import { MenuView } from "@react-native-menu/menu";
import { supabase } from "@/utils/supabase";
import { useToastController } from "@tamagui/toast";
import MoreOptions from "@/components/MoreOptions";
// import { useToastController } from "@tamagui/toast";

const columns = [
  { name: "Id", id: "id", flex: 1 },
  { name: "Cliente", id: "clients", flex: 3 },
  { name: "Fecha", id: "completed_date", flex: 3 },
  { name: "Más", id: "more", flex: 1 },
];

export default function QuotePage() {
  const toast = useToastController();

  const { left, right, bottom } = useSafeAreaInsets();
  const [sales, setSales] = useState<Sale[] | null>(null);


  function removeSale(id: number) {
    async function deleteClient() {
      const { error } = await supabase.from("sales").delete().eq("id", id);

      if (error) {
        toast.show("No se pudo eliminar la venta.", {
          duration: 2000,
          toastType: "error",
        });
        return;
      }

      setSales((sales ?? []).filter((sales) => sales.id !== id));
      toast.show("La venta ha sido eliminado.", {
        duration: 2000,
        toastType: "success",
      });
    }

    Alert.alert(
      "¿Estas seguro de borrar la venta?",
      "Esta acción no se puede deshacer.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          onPress: () => deleteClient(),
          style: "destructive",
        },
      ],
    );
  }


  // Function Row Content
  function rowContent(
    row: Record<string, any>,
    key: string,
  ): React.ReactNode | string {
    const content = row[key] as string;

    switch (key) {
      case "clients":
        const client = row["clients"] as Client;
        return client ? `${client.name} ${client.last_name}` : "";
      case "more":
        return (
          <MoreOptions
            actions={[
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
                method: () => removeSale(row["id"] as number)
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
        const { data: sales, error } = await supabase
          .from("sales")
          .select(`*, clients(*), sale_statuses!inner(*)`)
          .eq("sale_statuses.name", "Cotización");
        if (error || !sales) {
          console.log("Error cargando datos.", error);
          setSales([]);
          return;
        }
        console.log("Sales:", sales)
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
        <Link href="/providers/quotes/create" asChild>
          <Button
            icon={<Plus />}
            size={"$3"}
            theme="blue"
            borderWidth={1}
            borderColor="steelblue"
          >
            Nueva Cotización
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
