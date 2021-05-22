const md = require("markdown-it");
const dayjs = require("dayjs");

module.exports = function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy("images");

    eleventyConfig.addNunjucksFilter("md", value => { 
        if (!value) {
            return '';
        }

        return md().renderInline(value);
    });

    eleventyConfig.addNunjucksFilter("sitemapDate", value => { 
        return dayjs(value).format("YYYY-MM-DD");
    });

    eleventyConfig.addNunjucksFilter("blurredImage", value => { 
        return value.replace(/^\/images/, '\/images\/blurred');
    });

    eleventyConfig.addNunjucksFilter("lazyLoadImages", value => {
        return value.replace(/<img\s/g, '<img loading="lazy" ')
    });
};
