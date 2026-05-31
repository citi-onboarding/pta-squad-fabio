import React from 'react'
import {View, TextInput, TouchableOpacity, Text} from 'react-native'
import { useState } from 'react'

export function SearchBar(){
    const [textoBusca, setTextoBusca] = useState('')

    return(
        <View>
            <TextInput
                value={textoBusca}
                onChangeText={setTextoBusca}
                placeholder='João Silva'
                className='bg-white border border-gray-200 rounded-lg px-4 py-3 text-base text-gray-800'
            />
            <TouchableOpacity
                activeOpacity={0.8}
                className='bg-red-500 rounded-lg py-3 mt-3 items-center'
            ><Text className='text-white font-semibold text-base'>Buscar</Text>
            </TouchableOpacity>
        </View>
    )
}