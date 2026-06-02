import React from 'react'
import {View, TextInput, TouchableOpacity, Text} from 'react-native'
import { useState } from 'react'

interface SearchBarProps {
    onBuscar: (nome:string) => void
    totalEncontrados: number | null
}

export default function SearchBar({ onBuscar, totalEncontrados } : SearchBarProps){
    const [textoBusca, setTextoBusca] = useState('')
    return(
        <View>
            <TextInput
                value={textoBusca}
                onChangeText={setTextoBusca}
                placeholder='João Silva'
                placeholderTextColor='#6b7280'
                className='bg-white border border-gray-200 rounded-lg px-4 py-3 text-base text-gray-800'
            />
            <TouchableOpacity
                onPress={() => onBuscar(textoBusca)}
                activeOpacity={0.8}
                className='bg-red-500 rounded-lg py-3 mt-3 items-center'
            ><Text className='text-white font-semibold text-base'>Buscar</Text>
            </TouchableOpacity>
            {totalEncontrados !== null && (
                <Text className='mt-3 text-gray-500 text-sm'>
                    {totalEncontrados} empréstimo(s) encontrado(s)
                </Text>
            )}
        </View>
    )
}