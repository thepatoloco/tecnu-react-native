import { supabase } from "@/utils/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronDown } from "@tamagui/lucide-icons";
import { useToastController } from "@tamagui/toast";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Form, Spinner } from "tamagui";
import RNPickerSelect from "react-native-picker-select";
import { z } from "zod";

const exampleData = [
    { value: "1", label: "Hello" },
    { value: "2", label: "World" }
]

const SaleSchema = z.object({
  sale_status_id: z.string(),
  client_id: z.number()
});
type SaleInfo = z.infer<typeof SaleSchema>;

export default function CreateSale() {
  const toast = useToastController();

  const { left, right, bottom } = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saleForm = useForm<SaleInfo>({
    resolver: zodResolver(SaleSchema),
  });

  async function handleSubmit(input: SaleInfo) {
    // Submit new product to api
    setIsSubmitting(true);
    // const { error } = await supabase
    //   .from("sales")
    //   .insert([{ name: input.name, container_key: input.container_key }])
    //   .select();
    // setIsSubmitting(false);

    console.log("Sale:", input);

    // if (error) {
    //   console.log("Sale error:", error);
    //   toast.show("No se pudo crear la venta.", {
    //     duration: 2000,
    //     toastType: "error",
    //   });
    //   return;
    // }

    // toast.show("La venta se ha creado.", {
    //   duration: 2000,
    //   toastType: "success",
    // });
    // saleForm.reset();
    // router.push("../");
  }

  return (
    <ScrollView
      className="h-full w-full bg-transparent"
      style={{ marginLeft: left, marginRight: right, marginBottom: bottom }}
    >
      <Form
        onSubmit={saleForm.handleSubmit((data) => handleSubmit(data))}
        className="flex w-full flex-col items-stretch gap-4 p-4"
      >
        <View className="bg-transparent">
        <RNPickerSelect
            {...saleForm.register("sale_status_id")}
            onValueChange={(value) => saleForm.setValue("sale_status_id", value)}
            items={exampleData}
            style={pickerSelectStyle}
        />

        </View>

        {/* <View className="bg-transparent">
          <Input
            placeholder="Nombre"
            autoCapitalize="none"
            autoCorrect={false}
            {...productForm.register("name")}
            onChangeText={(text) => productForm.setValue("name", text)}
          />
          {productForm.formState.errors.name?.message && (
            <Text className="bg-transparent text-xs text-red-500">
              {productForm.formState.errors.name.message}
            </Text>
          )}
        </View>
        <View className="bg-transparent">
          <Input
            placeholder="Contenedor"
            autoCapitalize="none"
            autoCorrect={false}
            {...productForm.register("container_key")}
            onChangeText={(text) => productForm.setValue("container_key", text)}
          />
          {productForm.formState.errors.container_key?.message && (
            <Text className="bg-transparent text-xs text-red-500">
              {productForm.formState.errors.container_key.message}
            </Text>
          )}
        </View> */}

        <View className="flex flex-row items-center justify-stretch gap-2 bg-transparent">
          <Button
            onPress={() => {
              saleForm.reset();
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
              Crear Producto
            </Button>
          </Form.Trigger>
        </View>
      </Form>
    </ScrollView>
  );
}

const pickerSelectStyle = StyleSheet.create({
    inputIOS: {
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: 'gray',
      borderRadius: 4,
      color: 'black',
      paddingRight: 30, // to ensure the text is never behind the icon
    },
    inputAndroid: {
      fontSize: 16,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderWidth: 0.5,
      borderColor: 'purple',
      borderRadius: 8,
      color: 'black',
      paddingRight: 30, // to ensure the text is never behind the icon
    },
  });
