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
                    },
                    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
                },
            ],
        ],
    };
};
