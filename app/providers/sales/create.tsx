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
    { name: "Producto", id: "product", flex: 3 },
    { name: "Precio p/u", id: "price", flex: 2 },
    { name: "Cantidad", id: "quantity", flex: 2 },
    { name: "Más", id: "more", flex: 1 },
]

const SaleSchema = z.object({
  sale_status_id: z.number().nonnegative(),
  client_id: z.number().nonnegative(),
  products: z.array(z.object({
    product_id: z.number().nonnegative(),
    product: z.string(),
    price: z.number(),
    quantity: z.number()
  })).min(1)
});
type SaleInfo = z.infer<typeof SaleSchema>;

const ProductSchema = z.object({
    product_id: z.number().nonnegative(),
    price: z.number(),
    quantity: z.number()
});
type ProductInfo = z.infer<typeof ProductSchema>;

export default function CreateSale() {
  const toast = useToastController();

  const [saleStasus, setSaleStatus] = useState<{ value: string, label: string }[]>([]);
  const [clients, setClients] = useState<{ value: string, label: string }[]>([]);
  const [products, setProducts] = useState<{ value: string, label: string }[]>([]);

  const { left, right, bottom } = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);


  const saleForm = useForm<SaleInfo>({
    resolver: zodResolver(SaleSchema)
  });
  const saleFormWatch = useWatch(saleForm);

  const productForm = useForm<ProductInfo>({
    resolver: zodResolver(ProductSchema)
  });
  const productFormWatch = useWatch(productForm);


  async function handleSubmit(input: SaleInfo) {
    // Submit new product to api
    setIsSubmitting(true);
    const { data, error } = await supabase
      .from("sales")
      .insert([{ sale_status_id: input.sale_status_id, client_id: input.client_id }])
      .select();
    setIsSubmitting(false);

    console.log("Sale:", data);

    if (error) {
      console.log("Sale error:", error);
      toast.show("No se pudo crear la venta.", {
        duration: 2000,
        toastType: "error",
      });
      return;
    }

    const saleId = data[0].id;
    for (const prod of input.products) {
        const { error } = await supabase
            .from("product_sale")
            .insert([{ price_pu: prod.price, amount: prod.quantity, product_id: prod.product_id, sale_id: saleId }])
            .select();
    }

    toast.show("La venta se ha creado.", {
      duration: 2000,
      toastType: "success",
    });
    saleForm.reset();
    router.push("../");
  }

  async function addProduct(input: ProductInfo) {
    saleForm.setValue("products", [
        ...(saleForm.getValues("products")??[]), 
        {
            ...input,
            product: products.find((product) => Number(product.value) === input.product_id)?.label ?? "Sin nombre"
        }
    ]);
    productForm.reset({
        product_id: -1,
        quantity: undefined,
        price: undefined
    });
  }

  async function removeProduct(id: Number) {
    saleForm.setValue("products", [
        ...(saleForm.getValues("products")??[]).filter((product, index) => index !== id),
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
            .from('sale_statuses')
            .select('*')
            .neq("name", "Cotización");
        setSaleStatus((sale_statuses??[]).map((status) => ({ value: status.id.toString(), label: status.name })));
    }
    async function loadClientsData() {
        const { data: clients, error } = await supabase
            .from('clients')
            .select('*');
        setClients((clients??[]).map((client) => ({ value: client.id.toString(), label: `${client.name} ${client.last_name}` })));
    }
    async function loadProductsData() {
        const { data: products, error } = await supabase
            .from('products')
            .select('*');
        setProducts((products??[]).map((product) => ({ value: product.id.toString(), label: product.name })));
    }

    loadStatusData();
    loadClientsData();
    loadProductsData();
  }, []);

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
                onValueChange={(value) => saleForm.setValue("sale_status_id", Number(value))}
                items={saleStasus}
                style={pickerSelectStyle}
                placeholder={{ value: "-1", label: "Selecciona el estatus..." }}
            />
            {saleForm.formState.errors.sale_status_id?.message && (
                <Text className="bg-transparent text-xs text-red-500">
                    {saleForm.formState.errors.sale_status_id.message}
                </Text>
            )}
        </View>

        <View className="bg-transparent">
            <RNPickerSelect
                {...saleForm.register("client_id")}
                onValueChange={(value) => saleForm.setValue("client_id", Number(value))}
                items={clients}
                style={pickerSelectStyle}
                placeholder={{ value: "-1", label: "Selecciona el cliente..." }}
            />
            {saleForm.formState.errors.client_id?.message && (
                <Text className="bg-transparent text-xs text-red-500">
                    {saleForm.formState.errors.client_id.message}
                </Text>
            )}
        </View>

        <ScrollView className="pt-5" horizontal showsHorizontalScrollIndicator persistentScrollbar>
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
                        placeholder="Precio p/u"
                        autoCapitalize="none"
                        autoCorrect={false}
                        {...productForm.register("price")}
                        onChangeText={(text) => productForm.setValue("price", Number(text))}
                        value={productFormWatch.price?.toString()}
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
        </ScrollView>
        <Button
            theme="purple"
            flexGrow={1}
            onPress={productForm.handleSubmit((data) => addProduct(data))}
        >
            Añadir Producto
        </Button>

        <TableSchema
            columns={columns}
            rows={(saleFormWatch.products??[]).map((product, index) => ({ ...product, index }))}
            isLoading={false}
            rowsPerPage={5}
            rowContent={rowContent}
        />
        {saleForm.formState.errors.products?.message && (
            <Text className="bg-transparent text-xs text-red-500">
                {saleForm.formState.errors.products.message}
            </Text>
        )}

        <View className="flex flex-row items-center justify-stretch gap-2 bg-transparent pt-4">
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
              Crear Venta
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
