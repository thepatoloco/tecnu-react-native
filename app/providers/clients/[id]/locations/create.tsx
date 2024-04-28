import { Client } from "@/utils/dbTypes";
import { supabase } from "@/utils/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToastController } from "@tamagui/toast";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Form, Input, Spinner } from "tamagui";
import { z } from "zod";

const LocationSchema = z.object({
  address: z.string().min(1),
  postal_code: z.string().min(3).max(12),
  notes: z.string().optional(),
  client_id: z.number()
});
type LocationInfo = z.infer<typeof LocationSchema>;

export default function CreateLocation() {
  const toast = useToastController();

  const { left, right, bottom } = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { id } = useLocalSearchParams();

  const [client, setClient] = useState<Client | null>(null);


  const locationForm = useForm<LocationInfo>({
    resolver: zodResolver(LocationSchema),
  });

  async function handleSubmit(input: LocationInfo) {
    // Submit new client to api
    setIsSubmitting(true);
    const { error } = await supabase
      .from("locations")
      .insert([{ client_id: input.client_id, address: input.address, postal_code: input.postal_code, notes: (input.notes??"").length > 0 ? input.notes : null }])
      .select();
    setIsSubmitting(false);

    if (error) {
      console.log("Locations error:", error);
      toast.show("No se pudo crear la ubicación.", {
        duration: 2000,
        toastType: "error",
      });
      return;
    }

    toast.show("La ubicación se ha creado.", {
      duration: 2000,
      toastType: "success",
    });
    locationForm.reset();
    router.push("../");
  }

  // Load Client Data
  useEffect(() => {
    async function loadData() {
      let { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", Number(id));
      if (error || !data || data.length < 1) {
        console.log("Error cargando datos.");
        return;
      }
      console.log("Client Data:", data[0]);
      setClient(data[0]);
    }
    loadData();
  }, []);

  // Set client on form
  useEffect(() => {
    locationForm.setValue("client_id", client?.id??-1);
  }, [client])

  return (
    <ScrollView
      className="h-full w-full bg-transparent"
      style={{ marginLeft: left, marginRight: right, marginBottom: bottom }}
    >
      <Form
        onSubmit={locationForm.handleSubmit((data) => handleSubmit(data))}
        className="flex w-full flex-col items-stretch gap-4 p-4"
      >
        <View className="bg-transparent">
          <Input
            placeholder="Cliente"
            autoCapitalize="none"
            autoCorrect={false}
            value={client ? `${client.name} ${client.last_name}` : ""}
            disabled={true}
          />
          {locationForm.formState.errors.client_id?.message && (
            <Text className="bg-transparent text-xs text-red-500">
              {locationForm.formState.errors.client_id.message}
            </Text>
          )}
        </View>
        <View className="bg-transparent">
          <Input
            placeholder="Dirección"
            autoCapitalize="none"
            autoCorrect={false}
            {...locationForm.register("address")}
            onChangeText={(text) => locationForm.setValue("address", text)}
          />
          {locationForm.formState.errors.address?.message && (
            <Text className="bg-transparent text-xs text-red-500">
              {locationForm.formState.errors.address.message}
            </Text>
          )}
        </View>
        <View className="bg-transparent">
          <Input
            placeholder="Código Postal"
            autoCapitalize="none"
            autoCorrect={false}
            {...locationForm.register("postal_code")}
            onChangeText={(text) => locationForm.setValue("postal_code", text)}
          />
          {locationForm.formState.errors.postal_code?.message && (
            <Text className="bg-transparent text-xs text-red-500">
              {locationForm.formState.errors.postal_code.message}
            </Text>
          )}
        </View>
        <View className="bg-transparent">
          <Input
            placeholder="Notas"
            autoCapitalize="sentences"
            autoCorrect={true}
            {...locationForm.register("notes")}
            onChangeText={(text) => locationForm.setValue("notes", text)}
          />
          {locationForm.formState.errors.notes?.message && (
            <Text className="bg-transparent text-xs text-red-500">
              {locationForm.formState.errors.notes.message}
            </Text>
          )}
        </View>

        <View className="flex flex-row items-center justify-stretch gap-2 bg-transparent">
          <Button
            onPress={() => {
              locationForm.reset();
              router.push("../");
            }}
            theme="red_active"
            flexGrow={1}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Form.Trigger asChild disabled={isSubmitting}>
            <Button
              icon={isSubmitting ? <Spinner /> : undefined}
              theme="blue_active"
              flexGrow={1}
            >
              Crear Ubicación
            </Button>
          </Form.Trigger>
        </View>
      </Form>
    </ScrollView>
  );
}
