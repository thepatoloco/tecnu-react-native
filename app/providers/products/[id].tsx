import { Product } from "@/utils/dbTypes";
import { supabase } from "@/utils/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToastController } from "@tamagui/toast";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Form, Input, Spinner } from "tamagui";
import { z } from "zod";

const ProductSchema = z.object({
  name: z.string().min(1),
  container_key: z.string().min(1),
});
type ProductInfo = z.infer<typeof ProductSchema>;

export default function ProductPage() {
  const toast = useToastController();
  const { left, right, bottom } = useSafeAreaInsets();
  const { id } = useLocalSearchParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const productForm = useForm<ProductInfo>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: product?.name ?? "",
      container_key: product?.container_key ?? "",
    },
  });
  const productFormWatch = useWatch(productForm);

  const hasFormChanged = useMemo(() => {
    return productFormWatch.name !== product?.name || productFormWatch.container_key !== product?.container_key;
  }, [productFormWatch, product]);

  async function handleSubmit(input: ProductInfo) {
    setIsSubmitting(true);
    const { error } = await supabase
      .from("products")
      .update({ name: input.name, container_key: input.container_key })
      .eq("id", Number(id))
      .select();
    setIsSubmitting(false);

    if (error) {
      console.log("Product error:", error);
      toast.show("No se pudo modificar el producto.", {
        duration: 2000,
        toastType: "error",
      });
      return;
    }

    toast.show("El producto se ha modificado.", {
      duration: 2000,
      toastType: "success",
    });
    productForm.reset({
      name: product?.name ?? "",
      container_key: product?.container_key ?? "",
    });
    router.push("../");
  }

  useEffect(() => {
    async function loadData() {
      let { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", Number(id));
      if (error || !data || data.length < 1) {
        console.log("Error cargando datos.");
        return;
      }
      setProduct(data[0]);
    }
    loadData();
  }, []);

  useEffect(() => {
    productForm.reset({
      name: product?.name ?? "",
      container_key: product?.container_key ?? "",
    });
  }, [product]);

  return (
    <ScrollView
      className="w-full bg-transparent"
      style={{ marginLeft: left, marginRight: right, paddingBottom: bottom }}
    >
      {!product ? (
        <View className="w-full flex flex-row justify-center bg-transparent">
          <Spinner />
        </View>
      ) : (
        <Form
          onSubmit={productForm.handleSubmit((data) => handleSubmit(data))}
          className="w-full flex flex-col gap-2 p-3 bg-transparent"
        >
          <View className="flex flex-row gap-1 items-center bg-transparent">
            <Text className="font-bold text-lg">Nombre:</Text>
            <View className="flex-grow bg-transparent">
              <Input
                placeholder="Nombre"
                autoCapitalize="none"
                autoCorrect={false}
                {...productForm.register("name")}
                value={productFormWatch.name}
                onChangeText={(text) => productForm.setValue("name", text)}
              />
              {productForm.formState.errors.name?.message && (
                <Text className="bg-transparent text-xs text-red-500">
                  {productForm.formState.errors.name.message}
                </Text>
              )}
            </View>
          </View>
          <View className="flex flex-row gap-1 items-center bg-transparent">
            <Text className="font-bold text-lg">Contenedor:</Text>
            <View className="flex-grow bg-transparent">
              <Input
                placeholder="Contenedor"
                autoCapitalize="none"
                autoCorrect={false}
                {...productForm.register("container_key")}
                value={productFormWatch.container_key}
                onChangeText={(text) =>
                  productForm.setValue("container_key", text)
                }
              />
              {productForm.formState.errors.container_key?.message && (
                <Text className="bg-transparent text-xs text-red-500">
                  {productForm.formState.errors.container_key.message}
                </Text>
              )}
            </View>
          </View>

          {hasFormChanged && (
            <View className="flex flex-row items-center justify-stretch gap-2 bg-transparent">
              <Button
                onPress={() => {
                  productForm.reset({
                    name: product?.name ?? "",
                    container_key: product?.container_key ?? "",
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
      )}
    </ScrollView>
  );
}
