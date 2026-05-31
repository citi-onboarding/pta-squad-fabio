import React from "react";
import {View, Text, Image} from "react-native";
import { logoCiti } from "@assets";


export default function Header() {
    return(
        <View>
            <Text className="bg-white px-4 py-5  border-b border-gray-400 flex-row items-center text-[17px]">
                <Image
                  source={logoCiti}
                  className="w-16 h-8 mx-3"
                  style={{width:50, height:25}}
                  resizeMode="contain"/>
                Meus empréstimos
            </Text>
        </View>
    )
}