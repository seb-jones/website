const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

const md = require("markdown-it");
const moment = require("moment");
const slugify = require("slugify");

module.exports = function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy("images");

    eleventyConfig.addPlugin(syntaxHighlight);

    eleventyConfig.addNunjucksFilter("md", value => { 
        if (!value) {
            return '';
        }

        return md().renderInline(value);
    });

    eleventyConfig.addNunjucksFilter("date", value => { 
        return moment(value).format("Do MMMM YYYY");
    });

    eleventyConfig.addNunjucksFilter("sitemapDate", value => { 
        return moment(value).format("YYYY-MM-DD");
    });

    eleventyConfig.addNunjucksFilter("blurredImage", value => { 
        return value.replace(/^\/images/, '\/images\/blurred');
    });

    eleventyConfig.addNunjucksFilter("blogCategoryUrl", category => {
        return '/blog/categories/' + slugify(category, {
            replacement: "-",
            lower: true
        });
    });

    eleventyConfig.addNunjucksFilter("lazyLoadImages", value => {
        return value.replace(/<img\s/g, '<img loading="lazy" ')
    });

    const nonCategoryTags = ["all", "blog"];

    const filterCategoryTags = (tags) => { 
        return tags.filter(tag => !nonCategoryTags.includes(tag));
    };

    eleventyConfig.addNunjucksFilter("categoryTags", filterCategoryTags);

    eleventyConfig.addCollection("tagList", collection => {
        let tagSet = new Set();

        collection.getAll().forEach(item => {
            if ("tags" in item.data) {
                let tags = item.data.tags;

                tags = filterCategoryTags(tags);

                tags.forEach(tag => tagSet.add(tag));
            }
        });

        return [...tagSet];
    });
};
