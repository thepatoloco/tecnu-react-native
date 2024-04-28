import { supabase } from "@/utils/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToastController } from "@tamagui/toast";
import { router } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Form, Input, Spinner } from "tamagui";
import { z } from "zod";

const ClientSchema = z.object({
  name: z.string().min(1),
  last_name: z.string().min(1),
});
type ClientInfo = z.infer<typeof ClientSchema>;

export default function CreateClient() {
  const toast = useToastController();

  const { left, right, bottom } = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clientForm = useForm<ClientInfo>({
    resolver: zodResolver(ClientSchema),
  });

  async function handleSubmit(input: ClientInfo) {
    // Submit new client to api
    setIsSubmitting(true);
    const { error } = await supabase
      .from("clients")
      .insert([{ name: input.name, last_name: input.last_name }])
      .select();
    setIsSubmitting(false);

    if (error) {
      console.log("Client error:", error);
      toast.show("No se pudo crear el cliente.", {
        duration: 2000,
        toastType: "error",
      });
      return;
    }

    toast.show("El cliente se ha creado.", {
      duration: 2000,
      toastType: "success",
    });
    clientForm.reset();
    router.push("../");
  }

  return (
    <ScrollView
      className="h-full w-full bg-transparent"
      style={{ marginLeft: left, marginRight: right, marginBottom: bottom }}
    >
      <Form
        onSubmit={clientForm.handleSubmit((data) => handleSubmit(data))}
        className="flex w-full flex-col items-stretch gap-4 p-4"
      >
        <View className="bg-transparent">
          <Input
            placeholder="Nombre(s)"
            autoCapitalize="none"
            autoCorrect={false}
            {...clientForm.register("name")}
            onChangeText={(text) => clientForm.setValue("name", text)}
          />
          {clientForm.formState.errors.name?.message && (
            <Text className="bg-transparent text-xs text-red-500">
              {clientForm.formState.errors.name.message}
            </Text>
          )}
        </View>
        <View className="bg-transparent">
          <Input
            placeholder="Apellido(s)"
            autoCapitalize="none"
            autoCorrect={false}
            {...clientForm.register("last_name")}
            onChangeText={(text) => clientForm.setValue("last_name", text)}
          />
          {clientForm.formState.errors.last_name?.message && (
            <Text className="bg-transparent text-xs text-red-500">
              {clientForm.formState.errors.last_name.message}
            </Text>
          )}
        </View>

        <View className="flex flex-row items-center justify-stretch gap-2 bg-transparent">
          <Button
            onPress={() => {
              clientForm.reset();
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
              Crear Cliente
            </Button>
          </Form.Trigger>
        </View>
      </Form>
    </ScrollView>
  );
}
