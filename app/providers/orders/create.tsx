import { supabase } from "@/utils/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronDown } from "@tamagui/lucide-icons";
import { useToastController } from "@tamagui/toast";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Form, Input, Spinner } from "tamagui";
import RNPickerSelect from "react-native-picker-select";
import { z } from "zod";
import TableSchema from "@/components/TableSchema";
import MoreOptions from "@/components/MoreOptions";

const columns = [
    { name: "Producto", id: "product", flex: 4 },
    { name: "Cantidad", id: "quantity", flex: 2 },
    { name: "Más", id: "more", flex: 1 },
]

const OrderSchema = z.object({
  order_status_id: z.number().nonnegative(),
  products: z.array(z.object({
    product_id: z.number().nonnegative(),
    product: z.string(),
    quantity: z.number()
  })).min(1)
});
type OrderInfo = z.infer<typeof OrderSchema>;

const ProductSchema = z.object({
    product_id: z.number().nonnegative(),
    quantity: z.number()
});
type ProductInfo = z.infer<typeof ProductSchema>;

export default function CreateOrder() {
  const toast = useToastController();

  const [orderStasus, setOrderStatus] = useState<{ value: string, label: string }[]>([]);
  const [products, setProducts] = useState<{ value: string, label: string }[]>([]);

  const { left, right, bottom } = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);


  const orderForm = useForm<OrderInfo>({
    resolver: zodResolver(OrderSchema)
  });
  const orderFormWatch = useWatch(orderForm);

  const productForm = useForm<ProductInfo>({
    resolver: zodResolver(ProductSchema)
  });
  const productFormWatch = useWatch(productForm);


  async function handleSubmit(input: OrderInfo) {
    // Submit new product to api
    setIsSubmitting(true);
    const { data, error } = await supabase
      .from("orders")
      .insert([{ order_status_id: input.order_status_id }])
      .select();
    setIsSubmitting(false);

    console.log("Order:", data);

    if (error) {
      console.log("Sale error:", error);
      toast.show("No se pudo crear la venta.", {
        duration: 2000,
        toastType: "error",
      });
      return;
    }

    const orderId = data[0].id;
    for (const prod of input.products) {
      const { error } = await supabase
        .from("order_product")
        .insert([{ amount: prod.quantity, product_id: prod.product_id, order_id: orderId }])
        .select();
    }

    toast.show("La venta se ha creado.", {
      duration: 2000,
      toastType: "success",
    });
    orderForm.reset();
    router.push("../");
  }

  async function addProduct(input: ProductInfo) {
    orderForm.setValue("products", [
        ...(orderForm.getValues("products")??[]), 
        {
            ...input,
            product: products.find((product) => Number(product.value) === input.product_id)?.label ?? "Sin nombre"
        }
    ]);
    productForm.reset({
        product_id: -1,
        quantity: undefined,
    });
  }

  async function removeProduct(id: Number) {
    orderForm.setValue("products", [
        ...(orderForm.getValues("products")??[]).filter((product, index) => index !== id),
    ]);
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
                  method: () => removeProduct(row["index"] as number)
              },
              ]}
          />
        )
      default:
        return content;
    }
  }

  useEffect(() => {
    async function loadStatusData() {
        const { data: sale_statuses, error } = await supabase
            .from('order_statuses')
            .select('*');
        setOrderStatus((sale_statuses??[]).map((status) => ({ value: status.id.toString(), label: status.name })));
    }
    async function loadProductsData() {
        const { data: products, error } = await supabase
            .from('products')
            .select('*');
        setProducts((products??[]).map((product) => ({ value: product.id.toString(), label: product.name })));
    }

    loadStatusData();
    loadProductsData();
  }, []);

  return (
    <ScrollView
      className="h-full w-full bg-transparent"
      style={{ marginLeft: left, marginRight: right, marginBottom: bottom }}
    >
      <Form
        onSubmit={orderForm.handleSubmit((data) => handleSubmit(data))}
        className="flex w-full flex-col items-stretch gap-4 p-4"
      >
        <View className="bg-transparent">
            <RNPickerSelect
                {...orderForm.register("order_status_id")}
                onValueChange={(value) => orderForm.setValue("order_status_id", Number(value))}
                items={orderStasus}
                style={pickerSelectStyle}
                placeholder={{ value: "-1", label: "Selecciona el estatus..." }}
            />
            {orderForm.formState.errors.order_status_id?.message && (
                <Text className="bg-transparent text-xs text-red-500">
                    {orderForm.formState.errors.order_status_id.message}
                </Text>
            )}
        </View>

        <View className="bg-transparent flex flex-row gap-2 justify-between items-center w-full">
          <View className="bg-transparent flex-grow">
              <RNPickerSelect
                  {...productForm.register("product_id")}
                  onValueChange={(value) => productForm.setValue("product_id", Number(value))}
                  value={productFormWatch.product_id?.toString()}
                  items={products}
                  style={pickerSelectStyle}
                  placeholder={{ value: "-1", label: "Producto..." }}
              />
          </View>

          <View className="bg-transparent flex-grow">
              <Input
                  placeholder="Cantidad"
                  autoCapitalize="none"
                  autoCorrect={false}
                  {...productForm.register("quantity")}
                  onChangeText={(text) => productForm.setValue("quantity", Number(text))}
                  value={productFormWatch.quantity?.toString()}
              />
          </View>
        </View>
        <Button
            theme="purple"
            flexGrow={1}
            onPress={productForm.handleSubmit((data) => addProduct(data))}
        >
            Añadir Producto
        </Button>

        <TableSchema
            columns={columns}
            rows={(orderFormWatch.products??[]).map((product, index) => ({ ...product, index }))}
            isLoading={false}
            rowsPerPage={5}
            rowContent={rowContent}
        />
        {orderForm.formState.errors.products?.message && (
            <Text className="bg-transparent text-xs text-red-500">
                {orderForm.formState.errors.products.message}
            </Text>
        )}

        <View className="flex flex-row items-center justify-stretch gap-2 bg-transparent pt-4">
          <Button
            onPress={() => {
              orderForm.reset();
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
              Crear Órden
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
