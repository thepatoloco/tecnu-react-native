import { DataTable } from "react-native-paper";
import { View } from "./Themed";
import { Button, Spinner } from "tamagui";
import React, { useMemo, useState } from "react";
import { Text } from "react-native";
import { ArrowLeft, ArrowRight } from "@tamagui/lucide-icons";

interface TableSchemaProps {
    columns: { name: string, id: string, flex: number }[],
    rows: Record<string, any>[],
    isLoading?: boolean,
    rowsPerPage: number,
    rowContent: (row: Record<string, any>, key: string) => React.ReactNode|string
}

export default function TableSchema({ columns, rows, isLoading, rowsPerPage, rowContent }: TableSchemaProps) {
    const [actualPage, setActualPage] = useState(0);

    const pageQuantity = useMemo(() => {
        return Math.max(1, Math.ceil(rows.length/rowsPerPage));
    }, [rows]);
    const actualRows = useMemo(() => {
        return rows.slice(actualPage * rowsPerPage, (actualPage + 1) * rowsPerPage);
    }, [rows, actualPage]);

    function setPageWrap(newPage: number) {
        if (newPage < 0 || newPage >= pageQuantity) return;
        setActualPage(newPage);
    }

    return (
        <View className='bg-transparent'>
            <DataTable className='p-4'>
                <DataTable.Header className='bg-[#5791f1] rounded-lg'>
                    {columns.map((column, index) => (
                        <DataTable.Title key={index} style={{ flex: column.flex }}>{column.name}</DataTable.Title>
                    ))}
                </DataTable.Header>
                {isLoading ? (
                    <DataTable.Row>
                        <DataTable.Cell className='flex flex-row items-center justify-center'>
                            <Spinner/>
                        </DataTable.Cell>
                    </DataTable.Row>  
                ) : (
                    actualRows.length <= 0 ? (
                        <DataTable.Row>
                            <DataTable.Cell className='flex flex-row items-center justify-center'>
                                <Text className='text-xs text-gray-500'>Sin datos...</Text>
                            </DataTable.Cell>
                        </DataTable.Row>
                    ) : (
                        actualRows.map((row, index) => (
                            <DataTable.Row key={index}>
                                {columns.map((column, index) => (
                                    <DataTable.Cell key={index} style={{ flex: column.flex }}>
                                        {rowContent(row, column.id)}
                                    </DataTable.Cell>
                                ))}
                            </DataTable.Row>
                        ))
                    )
                )}
            </DataTable>
            {!isLoading && (
                <View className='flex flex-row justify-end items-center gap-2 px-4 bg-transparent'>
                    <Text>Página {actualPage + 1} de {pageQuantity}</Text>
                    <Button onPress={() => setPageWrap(actualPage - 1)} disabled={actualPage <= 0} theme={actualPage <= 0 ? 'blue' : 'blue_active'} icon={<ArrowLeft />}  />
                    <Button onPress={() => setPageWrap(actualPage + 1)} disabled={(actualPage + 1) >= pageQuantity} theme={(actualPage + 1) >= pageQuantity ? 'blue' : 'blue_active'} icon={<ArrowRight />} />
                </View>
            )}
        </View>
    )
}
