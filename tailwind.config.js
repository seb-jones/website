module.exports = {
    purge: [
        './**/*.html',
        './**/*.njk',
    ],
    theme: {
        extend: {
        },
    },
    variants: {},
    plugins: [],
    future: {
        removeDeprecatedGapUtilities: true,
        purgeLayersByDefault: true,
    },
}
