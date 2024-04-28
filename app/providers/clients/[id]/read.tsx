import MoreOptions from "@/components/MoreOptions";
import TableSchema from "@/components/TableSchema";
import { Client } from "@/utils/dbTypes";
import { supabase } from "@/utils/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { MenuView } from "@react-native-menu/menu";
import { MoreHorizontal, Plus } from "@tamagui/lucide-icons";
import { useToastController } from "@tamagui/toast";
import { Link, router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Platform, Pressable } from "react-native";
import { Alert } from "react-native";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Form, Input, Spinner } from "tamagui";
import { z } from "zod";

const columns = [
  { name: "Id", id: "id", flex: 1 },
  { name: "Dirección", id: "address", flex: 3 },
  { name: "Postal", id: "postal_code", flex: 3 },
  { name: "Más", id: "more", flex: 1 },
];

const ClientSchema = z.object({
  name: z.string().min(1),
  last_name: z.string().min(1),
});
type ClientInfo = z.infer<typeof ClientSchema>;

export default function ClientPage() {
  const toast = useToastController();
  const { left, right, bottom } = useSafeAreaInsets();
  const { id } = useLocalSearchParams();

  const [client, setClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clientForm = useForm<ClientInfo>({
    resolver: zodResolver(ClientSchema),
    defaultValues: {
      name: client?.name ?? "",
      last_name: client?.last_name ?? "",
    },
  });
  const clientFormWatch = useWatch(clientForm);

  const hasFormChanged = useMemo(() => {
    return (
      clientFormWatch.name !== client?.name ||
      clientFormWatch.last_name !== client?.last_name
    );
  }, [clientFormWatch, client]);

  async function handleSubmit(input: ClientInfo) {
    setIsSubmitting(true);
    const { data, error } = await supabase
      .from("clients")
      .update({ name: input.name, last_name: input.last_name })
      .eq("id", Number(id))
      .select();
    setIsSubmitting(false);

    if (error) {
      console.log("Client error:", error);
      toast.show("No se pudo modificar el cliente.", {
        duration: 2000,
        toastType: "error",
      });
      return;
    }

    toast.show("El cliente se ha modificado.", {
      duration: 2000,
      toastType: "success",
    });
    clientForm.reset({
      name: client?.name ?? "",
      last_name: client?.last_name ?? "",
    });
    router.push("../");
  }

  function removeLocation(id: number) {
    async function deleteLocation() {
      const { error } = await supabase.from("locations").delete().eq("id", id);

      if (error) {
        toast.show("No se pudo eliminar la ubicación.", {
          duration: 2000,
          toastType: "error",
        });
        return;
      }

      setClient(
        client
          ? {
              ...client,
              locations: (client.locations ?? []).filter(
                (location) => location.id !== id,
              ),
            }
          : null,
      );
      toast.show("La ubicación ha sido eliminada.", {
        duration: 2000,
        toastType: "success",
      });
    }

    Alert.alert(
      "¿Estas seguro de borrar la ubicación?",
      "Esta acción no se puede deshacer.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          onPress: () => deleteLocation(),
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
                  id: "delete",
                  title: "Eliminar",
                  attributes: {
                    destructive: true,
                  },
                  image: Platform.select({
                    ios: "trash",
                    android: "ic_menu_delete",
                  }),
                  method: () => removeLocation(row["id"] as number)
                },
            ]}
          />
        );
      default:
        return content;
    }
  }

  // Load user data into screen
  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        let { data, error } = await supabase
          .from("clients")
          .select(
            `
                  *,
                  locations (*)
                `,
          )
          .eq("id", Number(id));
        if (error || !data || data.length < 1) {
          console.log("Error cargando datos.");
          return;
        }
        console.log("Client Data:", data[0]);
        setClient(data[0]);
      }
      loadData();
    }, [])
  );

  // Set client data to form
  useEffect(() => {
    clientForm.reset({
      name: client?.name ?? "",
      last_name: client?.last_name ?? "",
    });
  }, [client]);

  return (
    <ScrollView
      className="w-full bg-transparent"
      style={{ marginLeft: left, marginRight: right, paddingBottom: bottom }}
    >
      {!client ? (
        <View className="w-full flex flex-row justify-center bg-transparent">
          <Spinner />
        </View>
      ) : (
        <View className="w-full flex flex-col">
          <Form
            onSubmit={clientForm.handleSubmit((data) => handleSubmit(data))}
            className="w-full flex flex-col gap-2 p-3 bg-transparent"
          >
            <View className="flex flex-row gap-1 items-center bg-transparent">
              <Text className="font-bold text-lg">Nombre:</Text>
              <View className="flex-grow bg-transparent">
                <Input
                  placeholder="Nombre(s)"
                  autoCapitalize="none"
                  autoCorrect={false}
                  {...clientForm.register("name")}
                  value={clientFormWatch.name}
                  onChangeText={(text) => clientForm.setValue("name", text)}
                />
                {clientForm.formState.errors.name?.message && (
                  <Text className="bg-transparent text-xs text-red-500">
                    {clientForm.formState.errors.name.message}
                  </Text>
                )}
              </View>
            </View>
            <View className="flex flex-row gap-1 bg-transparent">
              <Text className="font-bold text-lg">Apellido:</Text>
              <View className="flex-grow bg-transparent">
                <Input
                  placeholder="Apellido(s)"
                  autoCapitalize="none"
                  autoCorrect={false}
                  {...clientForm.register("last_name")}
                  value={clientFormWatch.last_name}
                  onChangeText={(text) =>
                    clientForm.setValue("last_name", text)
                  }
                />
                {clientForm.formState.errors.last_name?.message && (
                  <Text className="bg-transparent text-xs text-red-500">
                    {clientForm.formState.errors.last_name.message}
                  </Text>
                )}
              </View>
            </View>

            {hasFormChanged && (
              <View className="flex flex-row items-center justify-stretch gap-2 bg-transparent">
                <Button
                  onPress={() => {
                    clientForm.reset({
                      name: client?.name ?? "",
                      last_name: client?.last_name ?? "",
                    });
                  }}
                  theme="red_active"
                  flexGrow={1}
                  disabled={isSubmitting}
                >
                  Descartar
                </Button>
                <Form.Trigger asChild disabled={isSubmitting}>
                  <Button
                    icon={isSubmitting ? <Spinner /> : undefined}
                    theme="blue_active"
                    flexGrow={1}
                  >
                    Modificar
                  </Button>
                </Form.Trigger>
              </View>
            )}
          </Form>

          <View className="flex flex-row justify-end p-4 pb-0">
            <Link href={`/providers/clients/${id}/locations/create`} asChild>
              <Button
                icon={<Plus />}
                size={"$3"}
                theme="blue"
                borderWidth={1}
                borderColor="steelblue"
              >
                Nueva Ubicación
              </Button>
            </Link>
          </View>
          <TableSchema
            columns={columns}
            rows={client.locations ?? []}
            isLoading={!client}
            rowsPerPage={5}
            rowContent={rowContent}
          />
        </View>
      )}
    </ScrollView>
  );
}
