import { Href, usePathname, useRouter } from "expo-router";
import { useCallback, useReducer } from "react";
import { LayoutChangeEvent, Pressable, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useDerivedValue,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { NavigationItem, navigationItems } from "./tabItems";

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

interface TabButtonProps {
    item: NavigationItem;
    active: boolean;
    onLayout: (e: LayoutChangeEvent) => void;
    onPress: () => void;
}

const TabButton = ({ item, active, onLayout, onPress }: TabButtonProps) => {
    const animatedComponentCircleStyles = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    scale: withTiming(active ? 1 : 0, { duration: 250 }),
                },
            ],
        };
    });

    return (
        <Pressable
            onPress={onPress}
            onLayout={onLayout}
            className="h-[60px] w-[60px] -mt-[14px] p-1"
        >
            <Animated.View
                style={animatedComponentCircleStyles}
                className="flex-1 rounded-full bg-[#9887C3]"
            />
            <Animated.View className="absolute inset-0 justify-center items-center">
                <item.icon size={32} color={"#F8FAFC"} variant="Outline" />
            </Animated.View>
        </Pressable>
    );
};

export default function TabNavigation() {
    const router = useRouter();
    const pathname = usePathname();
    const { bottom } = useSafeAreaInsets();

    const reducer = (state: any, action: { x: number; index: number }) => {
        return [...state, { x: action.x, index: action.index }];
    };

    const [layout, dispatch] = useReducer(reducer, []);

    const handleLayout = (event: LayoutChangeEvent, index: number) => {
        dispatch({ x: event.nativeEvent.layout.x, index });
    };

    const handleTabPress = useCallback(
        (route: Href) => {
            if (pathname !== route) {
                router.replace(route);
            }
        },
        [pathname, router]
    );

    const activeIndex = navigationItems.findIndex(
        (item) => item.route === pathname
    );

    const xOffset = useDerivedValue(() => {
        if (layout.length !== navigationItems.length) return 0;
        const foundLayout = [...layout].find(
            ({ index }) => index === activeIndex
        );
        return foundLayout ? foundLayout.x - 25 : 0;
    }, [activeIndex, layout]);

    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: withTiming(xOffset.value, { duration: 250 }) },
            ],
        };
    });

    return (
        <View
            style={{ paddingBottom: bottom }}
            className=" bottom-0 left-0 right-0 bg-[#1E162D] shadow-lg"
        >
            <AnimatedSvg
                width={140}
                height={80}
                viewBox="0 0 140 80"
                style={[{ position: "absolute" }, animatedStyles]}
            >
                <Path
                    fill="black"
                    d="M20 0H0c11.046 0 20 8.953 20 20v5c0 19.33 15.67 35 35 35s35-15.67 35-35v-5c0-11.045 8.954-20 20-20H20z"
                />
            </AnimatedSvg>

            <View className="flex-row justify-evenly pt-[10px]">
                {navigationItems.map((item, index) => {
                    const active = pathname === item.route;

                    return (
                        <TabButton
                            key={`tab-${item.testID}`}
                            item={item}
                            active={active}
                            onLayout={(e) => handleLayout(e, index)}
                            onPress={() => handleTabPress(item.route)}
                        />
                    );
                })}
            </View>
        </View>
    );
}
