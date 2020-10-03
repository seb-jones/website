let mix = require('laravel-mix');

const tailwindcss = require('tailwindcss');

mix.sass('sass/app.scss', '_site/')
   .js('galaxy/scripts.js', '_site/galaxy/scripts.js')
   .options({
       processCssUrls: false,
       postCss: [ tailwindcss('./tailwind.config.js') ]
   });
