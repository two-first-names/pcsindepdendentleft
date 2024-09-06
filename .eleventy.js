module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "wpsrc/wp-content": "wp-content"});
}