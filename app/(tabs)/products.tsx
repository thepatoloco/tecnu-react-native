import TableSchema from "@/components/TableSchema";
import { Product } from "@/utils/dbTypes";
import { supabase } from "@/utils/supabase";
import { MenuView } from "@react-native-menu/menu";
import { MoreHorizontal, Plus } from "@tamagui/lucide-icons";
import { useToastController } from "@tamagui/toast";
import { Link, router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "tamagui";

const columns = [
    { name: 'Id', id: 'id', flex: 1 }, 
    { name: 'Nombre', id: 'name', flex: 5 },
    { name: 'Más', id: 'more', flex: 1 }
]

export default function QuotePage() {
    const toast = useToastController();
    const { left, right, bottom } = useSafeAreaInsets();
    const [products, setProducts] = useState<Product[]|null>(null);


    function openProduct(id: number) {
        router.push(`/providers/products/${id}`);
    }


    function removeProduct(id: number) {
        async function deleteProduct() {
            const { error } = await supabase.from('products')
                .delete()
                .eq('id', id);
            
            if (error) {
                toast.show('No se pudo eliminar el producto.', {
                    duration: 2000,
                    toastType: 'error'
                });
                return;
            }

            setProducts((products??[]).filter((product) => product.id !== id));
            toast.show('El producto ha sido eliminado.', {
                duration: 2000,
                toastType: 'success'
            });
        }

        Alert.alert('¿Estas seguro de borrar el producto?', 'Esta acción no se puede deshacer.', [
            {
                text: 'Cancelar',
                style: 'cancel'
            },
            {
                text: 'Eliminar',
                onPress: () =>  deleteProduct(),
                style: 'destructive'
            }
        ]);
    }

    // Function Row Content
    function rowContent(row: Record<string, any>, key: string): React.ReactNode|string {
        const content = row[key] as string;
    
        switch(key) {
            case 'more':
                return (
                    <MenuView
                        // Select the correct function depending on the function activating
                        onPressAction={({ nativeEvent }) => {
                            switch(nativeEvent.event) {
                                case 'open':
                                    openProduct(row['id'] as number);
                                    break;
                                case 'delete':
                                    removeProduct(row['id'] as number);
                                    break;
                            }
                        }}
                        actions={[
                            {
                                id: 'open',
                                title: 'Ver',
                                image: Platform.select({
                                    ios: 'eye.fill',
                                    android: 'baseline_visibility_20'
                                })
                            },
                            {
                                id: 'delete',
                                title: 'Eliminar',
                                attributes: {
                                    destructive: true,
                                },
                                image: Platform.select({
                                    ios: 'trash',
                                    android: 'ic_menu_delete',
                                }),
                            },
                        ]}
                    >
                        <Pressable>
                            {({ pressed }) => (
                                <MoreHorizontal style={{ opacity: pressed ? 0.5 : 1 }} />
                            )}
                        </Pressable>
                    </MenuView>
                    
                )
            default:
                return content;
        }
    }  

    // Colect product list from db
    useFocusEffect(
        useCallback(() => {
            async function loadData() {
                let { data: products, error } = await supabase.from('products').select('*');
                if (error || !products) {
                    console.log('Error cargando datos.');
                    setProducts([]);
                    return;
                }
                setProducts((products as Product[]).sort((a, b) => a.id - b.id));
            }
            loadData();
        }, [])
    );

    return (
        <ScrollView className='bg-transparent w-full h-full' style={{ marginLeft: left, marginRight: right, paddingBottom: bottom }}>
            <View className='flex flex-row justify-end p-4 pb-0'>
                <Link href="/providers/products/create" asChild>
                    <Button icon={<Plus/>} size={'$3'} theme='blue' borderWidth={1} borderColor='steelblue'>
                        Nuevo Producto
                    </Button>
                </Link>
            </View>
            <TableSchema
                columns={columns}
                rows={products??[]}
                isLoading={!products}
                rowsPerPage={10}
                rowContent={rowContent}
            />
        </ScrollView>
    )
}
