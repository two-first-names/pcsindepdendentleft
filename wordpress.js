const SITE_NAME = 'pcsindependentleft.com'

const { mkdirSync, createWriteStream, writeFileSync} = require('fs');
const { dirname} = require('path');
const { pipeline} = require('stream');
const { promisify} = require('util');

function forEachPost(callback, next_page) {
  let url = `https://public-api.wordpress.com/rest/v1.1/sites/${SITE_NAME}/posts`
  if(next_page)
    url += `?page_handle=${next_page}`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      for(const post of data.posts) {
        callback(post);
      }
      if(data.meta.next_page) {
        const page_handle = data.meta.next_page
          .replace('%', '%25')
          .replace('=', '%3D')
          .replace('&','%26')
        forEachPost(callback, page_handle);
      }
    });
}

function downloadWpContent(url) {
  const path = url.replace(`https://${SITE_NAME}`, 'wpsrc');
  mkdirSync(dirname(path), { recursive: true });
  fetch(url).then(response =>
    promisify(pipeline)(response.body, createWriteStream(path))
  );
}

function postCallback(post) {
  const title = post.title;
  const slug = post.slug;
  const path = post.URL.replace(`http://${SITE_NAME}`, '').substring(1).replace(`${slug}/`, '');
  mkdirSync(`wpsrc/${path}`, { recursive: true });

  const permalink = `/${path}${slug}/`
  const content = post.content
    .replaceAll('https://pcsindependentleft.com/', '/')
    .trim();
  const excerpt = post.excerpt
    .replaceAll('<p>', '')
    .replaceAll('</p>', '')
    .trim();

  const matches = post.content.match(/https:\/\/pcsindependentleft.com\/wp-content\/[^"? ]+/g)

  const seen = []

  if (matches) {
    for (const match of matches) {
      if (seen.includes(match))
        continue;
      seen.push(match);
      downloadWpContent(match);
    }
  }

  const frontmatter = {
    title,
    permalink,
    date: post.date,
    author: post.author.name,
    excerpt,
    tags: ['posts'],
    layout: 'post.liquid'
  }

  writeFileSync(`wpsrc/${path}/${slug}.html`, `---\n${JSON.stringify(frontmatter, null, 2)}\n---\n${content}`);
}

forEachPost(postCallback)