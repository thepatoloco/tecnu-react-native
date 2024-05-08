import TableSchema from "@/components/TableSchema";
import { Order } from "@/utils/dbTypes";
import { supabase } from "@/utils/supabase";
import React, { useCallback, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "tamagui";
import { MoreHorizontal, Plus } from "@tamagui/lucide-icons";
import { Link, router, useFocusEffect } from "expo-router";
import { MenuView } from "@react-native-menu/menu";
import MoreOptions from "@/components/MoreOptions";
import { useToastController } from "@tamagui/toast";

const columns = [
  { name: "Id", id: "id", flex: 1 },
  { name: "Producto", id: "product", flex: 3 },
  { name: "Fecha", id: "created_at", flex: 3 },
  { name: "Más", id: "more", flex: 1 },
];

export default function QuotePage() {
  const toast = useToastController();

  const { left, right, bottom } = useSafeAreaInsets();
  const [orders, setOrders] = useState<Order[] | null>(null);

  function removeOrder(id: number) {
    async function deleteClient() {
      const { error } = await supabase.from("orders").delete().eq("id", id);

      if (error) {
        toast.show("No se pudo eliminar la órden.", {
          duration: 2000,
          toastType: "error",
        });
        return;
      }

      setOrders((orders ?? []).filter((order) => order.id !== id));
      toast.show("La órden ha sido eliminada.", {
        duration: 2000,
        toastType: "success",
      });
    }

    Alert.alert(
      "¿Estas seguro de borrar la órden?",
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
      case "product":
        const productQuant = ((row as Order).order_product??[]).length;
        return productQuant > 0 ? `${(row as Order).order_product![0].products?.name}${productQuant > 1 ? ", ..." : ""}` : "Sin productos"
      case "more":
        return (
          <MoreOptions
            actions={[
              // {
              //   id: "open",
              //   title: "Ver",
              //   image: Platform.select({
              //     ios: "eye.fill",
              //     android: "baseline_visibility_20",
              //   }),
              //   method: () => console.log("open")
              // },
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
                method: () => removeOrder(row["id"] as number)
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
        let { data: orders, error } = await supabase
          .from("orders")
          .select(`*,
          order_product(*,
            products(*)
          )`);
        if (error || !orders) {
          console.log("Error cargando datos.");
          setOrders([]);
          return;
        }
        setOrders(orders);
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
        <Link href="/providers/orders/create" asChild>
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
