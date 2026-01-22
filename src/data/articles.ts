import React, { useState, useEffect } from 'react';
import { ArticleCategory, Language, Article } from '../../types';

export interface ArticlesPageContent {
  title: string;
  description: string;
}

export const ARTICLES_PAGE_DATA: Record<Language, ArticlesPageContent> = {
  zh: {
    title: '文章',
    description: '个人思考、学习分享与生活记录。'
  },
  en: {
    title: 'Articles',
    description: 'Thoughts, learning journey, and life records.'
  }
};

export const SHAOYANG_NOTES_DATA: Record<Language, ArticlesPageContent> = {
  zh: {
    title: '少阳手记',
    description: '个人思考、学习分享与生活记录。'
  },
  en: {
    title: 'Notes',
    description: 'Thoughts, learning journey, and life records.'
  }
};

export const SHAOYANG_INSTITUTE_DATA: Record<Language, ArticlesPageContent> = {
  zh: {
    title: '少阳研究所',
    description: '深度研究、技术探索与学术分享。'
  },
  en: {
    title: 'Institute',
    description: 'Deep research, technical exploration, and academic sharing.'
  }
};

// 自动导入少阳手记的 .md 文件
const shaoYangNotesFiles = import.meta.glob('../articles/少阳手记/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

// 自动导入少阳研究所的 .md 文件
const shaoYangInstituteFiles = import.meta.glob('../articles/少阳研究所/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

// 通用文章加载函数
const loadArticlesFromFiles = (files: Record<string, string>, basePath: string): Article[] => {
  return Object.entries(files).map(([path, content]) => {

    // 手动解析 front matter
    const contentStr = content as string;
    const frontMatterMatch = contentStr.match(/^---[\r\n]+([\s\S]*?)[\r\n]+---[\r\n]+([\s\S]*)$/);

    let data: any = {};
    let markdownContent = contentStr;

    if (frontMatterMatch) {
      const frontMatter = frontMatterMatch[1];
      markdownContent = frontMatterMatch[2];

      // 简单解析 YAML
      const lines = frontMatter.split('\n');
      for (const line of lines) {
        if (line.includes(':')) {
          const [key, ...valueParts] = line.split(':');
          const value = valueParts.join(':').trim();
          if (key.trim() === 'title') data.title = value.replace(/^["']|["']$/g, '');
          else if (key.trim() === 'Date') data.Date = value;
          else if (key.trim() === 'image') data.image = value.replace(/^["']|["']$/g, '');
          else if (key.trim() === 'tags') {
            // 简单处理 tags
            const nextLines = lines.slice(lines.indexOf(line) + 1);
            const tags: string[] = [];
            for (const tagLine of nextLines) {
              if (tagLine.trim().startsWith('- ')) {
                tags.push(tagLine.trim().substring(2));
              } else if (tagLine.trim() === '') continue;
              else break;
            }
            data.tags = tags;
          }
        }
      }
    }

    // 从路径提取分类和 id
    const pathParts = path.split('/');
    const category = pathParts[pathParts.length - 2]; // 文件夹名
    const fileName = pathParts[pathParts.length - 1].replace('.md', '');
    const id = `${category}-${fileName}`;

    const article = {
      id,
      title: data.title || fileName,
      category,
      link: `/articles/${id}`,
      coverImage: data.image,
      date: data.Date,
      content: markdownContent.trim(),
      tags: data.tags || [],
    };

    return article;
  });
};

export const useShaoYangNotes = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const articleList = loadArticlesFromFiles(shaoYangNotesFiles, '../articles/少阳手记');
      setArticles(articleList);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, []);

  return { articles, loading };
};

export const useShaoYangInstitute = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const articleList = loadArticlesFromFiles(shaoYangInstituteFiles, '../articles/少阳研究所');
      setArticles(articleList);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, []);

  return { articles, loading };
};

// 保持向后兼容的旧 API（加载所有文章）
export const useArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const notesArticles = loadArticlesFromFiles(shaoYangNotesFiles, '../articles/少阳手记');
      const instituteArticles = loadArticlesFromFiles(shaoYangInstituteFiles, '../articles/少阳研究所');
      const allArticles = [...notesArticles, ...instituteArticles];
      setArticles(allArticles);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, []);

  return { articles, loading };
};

// 为了向后兼容，提供静态数据（在服务端渲染时使用）
export const ARTICLE_DATA: Article[] = [];
