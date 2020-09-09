const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

let md = require('markdown-it')();

module.exports = function(eleventyConfig) {
    eleventyConfig.addPlugin(syntaxHighlight);
    
    eleventyConfig.addNunjucksFilter("md", (value) => { 
        return md.renderInline(value);
    });
};
