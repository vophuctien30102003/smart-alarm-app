import { Stack } from "expo-router";
import "./globals.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";

export default function RootLayout() {
    return (
        <GluestackUIProvider mode="dark">
            <Stack />
        </GluestackUIProvider>
    );
}
