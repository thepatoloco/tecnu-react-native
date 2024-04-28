import TableSchema from "@/components/TableSchema";
import { Client } from "@/utils/dbTypes";
import { supabase } from "@/utils/supabase";
import React, { useCallback, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "tamagui";
import { MoreHorizontal, Plus } from "@tamagui/lucide-icons";
import { Link, router, useFocusEffect } from "expo-router";
import { MenuView } from "@react-native-menu/menu";
import { useToastController } from "@tamagui/toast";
import MoreOptions from "@/components/MoreOptions";

const columns = [
  { name: "Id", id: "id", flex: 1 },
  { name: "Nombre", id: "name", flex: 3 },
  { name: "Apellido", id: "last_name", flex: 3 },
  { name: "Más", id: "more", flex: 1 },
];

export default function ClientsPage() {
  const toast = useToastController();
  const { left, right, bottom } = useSafeAreaInsets();
  const [clients, setClients] = useState<Client[] | null>(null);

  function openClient(id: number) {
    router.push(`/providers/clients/${id}/read`);
  }

  function removeClient(id: number) {
    async function deleteClient() {
      const { error } = await supabase.from("clients").delete().eq("id", id);

      if (error) {
        toast.show("No se pudo eliminar el cliente.", {
          duration: 2000,
          toastType: "error",
        });
        return;
      }

      setClients((clients ?? []).filter((client) => client.id !== id));
      toast.show("El cliente ha sido eliminado.", {
        duration: 2000,
        toastType: "success",
      });
    }

    Alert.alert(
      "¿Estas seguro de borrar el usuario?",
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
                method: () => openClient(row["id"] as number)
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
                method: () => removeClient(row["id"] as number)
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
        let { data: clients, error } = await supabase
          .from("clients")
          .select("*");
        if (error || !clients) {
          console.log("Error cargando datos.");
          setClients([]);
          return;
        }
        setClients((clients as Client[]).sort((a, b) => a.id - b.id));
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
            Nuevo Cliente
          </Button>
        </Link>
      </View>
      <TableSchema
        columns={columns}
        rows={clients ?? []}
        isLoading={!clients}
        rowsPerPage={10}
        rowContent={rowContent}
      />
    </ScrollView>
  );
}
