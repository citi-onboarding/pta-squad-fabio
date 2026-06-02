import React from "react";
import {View, Text, Image} from "react-native";
import { logoCiti } from "@assets";


export default function Header() {
    return(
        <View className="bg-white px-4 py-5 border-b border-gray-400 flex-row items-center">
            <Image
              source={logoCiti}
              style={{width:50, height:25}}
              resizeMode="contain"/>
            <Text className="text-[17px] ml-3">Meus empréstimos</Text>
        </View>
    )
}