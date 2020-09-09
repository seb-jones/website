const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

const md = require("markdown-it");
const moment = require("moment");

module.exports = function(eleventyConfig) {
    eleventyConfig.addPlugin(syntaxHighlight);
    
    eleventyConfig.addNunjucksFilter("md", (value) => { 
        return md().renderInline(value);
    });

    eleventyConfig.addNunjucksFilter("date", (value) => { 
        return moment(value).format("Do MMMM YYYY");
    });
};
