let mix = require('laravel-mix');

const tailwindcss = require('tailwindcss');

mix.sass('sass/app.scss', '_site/')
   .copy('galaxy/script.js', '_site/galaxy/script.js')
   .options({
       processCssUrls: false,
       postCss: [ tailwindcss('./tailwind.config.js') ]
   });
