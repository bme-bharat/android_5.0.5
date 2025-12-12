import { DrawerContentScrollView } from "@react-navigation/drawer";
import { useEffect, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import DeviceInfo from "react-native-device-info";


const CustomDrawerContent = (props) => {
    const [deviceInfo, setDeviceInfo] = useState({
        version: '',
        brand: '',
        systemVersion: '',
    });

    useEffect(() => {
        const fetchDeviceDetails = async () => {
            const version = await DeviceInfo.getVersion();
            const brand = DeviceInfo.getBrand();
            const systemVersion = await DeviceInfo.getSystemVersion();
            setDeviceInfo({ version, brand, systemVersion });
        };

        fetchDeviceDetails();
    }, []);

    return (
        <DrawerContentScrollView
            {...props}
            contentContainerStyle={{ flex: 1, justifyContent: 'space-between', paddingTop: 0,  }}
            scrollEnabled={false}
        >
            <View >
                <View style={{ alignSelf: 'center', alignItems: 'center', width: '85%', height: 120, }} >
                    <Image
                        source={require('../images/homepage/NavIcon.png')}
                        style={{
                            width: '100%',
                            height: 120,
                            resizeMode: 'contain',
                            
                        }}
                    />
                </View>

                {props.children}
                {props.state.routes.map((route, index) => {
                    const focused = props.state.index === index;
                    const { options } = props.descriptors[route.key];
                    const label = options.drawerLabel ?? options.title ?? route.name;
                    const IconComponent = options.drawerIcon;

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={() => props.navigation.navigate(route.name)}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingVertical: 12,
                                paddingHorizontal: 16,
                                backgroundColor: focused ? '#E5F0FB' : 'transparent',

                            }}
                        >
                            {IconComponent && <IconComponent color={focused ? '#075cab' : '#000'} size={20} />}

                            <Text
                                style={{
                                    marginLeft: 16,
                                    fontWeight: focused ? 'bold' : 'normal',
                                    color: focused ? '#075cab' : '#000',
                                }}
                            >
                                {label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>


            <View
                style={{
                    padding: 16,
                    borderTopWidth: 1,
                    borderTopColor: '#eee',
                    alignItems: 'center',
                    marginBottom: 10
                }}
            >
                <Text style={{ fontSize: 12, color: 'gray' }}>
                    Version: {deviceInfo.version}
                </Text>
                {/* <Text style={{ fontSize: 12, color: 'gray' }}>
                    Device: {deviceInfo.brand}
                </Text>
                <Text style={{ fontSize: 12, color: 'gray' }}>
                    OS: {deviceInfo.systemVersion}
                </Text> */}
            </View>
        </DrawerContentScrollView>
    );
};

export default CustomDrawerContent;