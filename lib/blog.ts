import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const readingTime = require('reading-time');

const BLOG_DIR = path.join(process.cwd(), 'content/blog');

export type Post = {
  slug: string;
  title: string;
  date: string;
  category: string;
  lang: 'en' | 'fa';
  description: string;
  readingTime: string;
  content: string;
};

export type PostMeta = Omit<Post, 'content'>;

function parsePost(filename: string): Post {
  const slug = filename.replace(/\.mdx$/, '');
  const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf-8');
  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? '',
    category: data.category ?? '',
    lang: data.lang === 'fa' ? 'fa' : 'en',
    description: data.description ?? '',
    readingTime: readingTime(content).text as string,
    content,
  };
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map(parsePost)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(({ content, ...meta }) => meta)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): Post {
  return parsePost(`${slug}.mdx`);
}

export function getPostsByLang(lang: 'en' | 'fa'): PostMeta[] {
  return getAllPosts().filter((p) => p.lang === lang);
}
