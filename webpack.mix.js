let mix = require('laravel-mix');

const tailwindcss = require('tailwindcss');

mix.sass('sass/app.scss', '_site/')
   .options({
       processCssUrls: false,
       postCss: [ tailwindcss('./tailwind.config.js') ]
   });
