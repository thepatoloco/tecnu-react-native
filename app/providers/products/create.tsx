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

const ProductSchema = z.object({
  name: z.string().min(1),
  container_key: z.string().min(1),
});
type ProductInfo = z.infer<typeof ProductSchema>;

export default function CreateProduct() {
  const toast = useToastController();

  const { left, right, bottom } = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const productForm = useForm<ProductInfo>({
    resolver: zodResolver(ProductSchema),
  });

  async function handleSubmit(input: ProductInfo) {
    // Submit new product to api
    setIsSubmitting(true);
    const { error } = await supabase
      .from("products")
      .insert([{ name: input.name, container_key: input.container_key }])
      .select();
    setIsSubmitting(false);

    if (error) {
      console.log("Product error:", error);
      toast.show("No se pudo crear el producto.", {
        duration: 2000,
        toastType: "error",
      });
      return;
    }

    toast.show("El producto se ha creado.", {
      duration: 2000,
      toastType: "success",
    });
    productForm.reset();
    router.push("../");
  }

  return (
    <ScrollView
      className="h-full w-full bg-transparent"
      style={{ marginLeft: left, marginRight: right, marginBottom: bottom }}
    >
      <Form
        onSubmit={productForm.handleSubmit((data) => handleSubmit(data))}
        className="flex w-full flex-col items-stretch gap-4 p-4"
      >
        <View className="bg-transparent">
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
        </View>

        <View className="flex flex-row items-center justify-stretch gap-2 bg-transparent">
          <Button
            onPress={() => {
              productForm.reset();
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
