module.exports = function (eleventyConfig) {
  eleventyConfig.setUseGitIgnore(false);
  eleventyConfig.addPassthroughCopy('assets');
  eleventyConfig.addPassthroughCopy({ "wpsrc/wp-content": "wp-content"});
}