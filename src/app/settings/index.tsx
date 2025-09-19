import { Text } from '@/components/ui/text';
import { colors } from '@/constants';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ScrollView, TouchableOpacity, View } from 'react-native';

export default function Settings() {
    const settingItems = [
        {
            title: "Notifications",
            subtitle: "Sound and vibration settings",
            icon: "bell",
            route: "",
        },
        {
            title: "Appearance",
            subtitle: "Theme settings",
            icon: "lightbulb-o",
            route: "", 
        },
        {
            title: "Backup",
            subtitle: "Data synchronization",
            icon: "cloud",
            route: "",
        },
        {
            title: "About App",
            subtitle: "Version 1.0.0",
            icon: "info-circle",
            route: "",
        },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: 50 }}>
            <ScrollView className="flex-1 px-6">
                {settingItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        className="flex-row items-center py-4 px-4 rounded-xl mb-3"
                        style={{ backgroundColor: colors.surface }}
                        activeOpacity={0.7}
                    >
                        <View 
                            className="w-10 h-10 rounded-full items-center justify-center mr-4"
                            style={{ backgroundColor: colors.primary + '20' }}
                        >
                            <FontAwesome 
                                name={item.icon as any} 
                                size={20} 
                                color={colors.primary} 
                            />
                        </View>
                        <View className="flex-1">
                            <Text 
                                className="text-lg font-semibold mb-1"
                                style={{ color: colors.text }}
                            >
                                {item.title}
                            </Text>
                            <Text 
                                className="text-sm"
                                style={{ color: colors.textSecondary }}
                            >
                                {item.subtitle}
                            </Text>
                        </View>
                        {item.route && (
                            <FontAwesome 
                                name="chevron-right" 
                                size={16} 
                                color={colors.textSecondary} 
                            />
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}
