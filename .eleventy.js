const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

const md = require("markdown-it");
const moment = require("moment");

module.exports = function(eleventyConfig) {
    eleventyConfig.addPlugin(syntaxHighlight);

    eleventyConfig.addNunjucksFilter("md", (value) => { 
        if (!value) {
            return '';
        }

        return md().renderInline(value);
    });

    eleventyConfig.addNunjucksFilter("date", (value) => { 
        return moment(value).format("Do MMMM YYYY");
    });

    eleventyConfig.addNunjucksFilter("blurredImage", (value) => { 
        return value.replace(/^\/images/, '\/images\/blurred');
    });

    eleventyConfig.addCollection("tagList", function (collection) {
        let tagSet = new Set();

        collection.getAll().forEach(function(item) {
            if ("tags" in item.data) {
                let tags = item.data.tags;

                tags = tags.filter(function (item) {
                    return !["all", "blog"].includes(item);
                });

                for (const tag of tags) {
                    tagSet.add(tag);
                }
            }
        });

        return [...tagSet];
    });
};
