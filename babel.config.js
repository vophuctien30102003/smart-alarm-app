module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            ["babel-preset-expo", { jsxImportSource: "nativewind" }],
            "nativewind/babel",
        ],
        plugins: [
            [
                "module-resolver",
                {
                    alias: {
                        "@": "./src",
                        "@features": "./src/features",
                        "@features/alarm-clock": "./src/features/alarm-clock",
                        "@features/map": "./src/features/map",
                        "@features/settings": "./src/features/settings",
                    },
                    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
                },
            ],
        ],
    };
};
