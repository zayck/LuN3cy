import { Category, Project, Experience, Skill, Language, HonorsData, Article } from './types';
import { Sparkles, Image, History, Send } from 'lucide-react';
import { PROJECT_DATA } from './src/data/projects';
import { ARTICLE_DATA } from './src/data/articles';

export const CATEGORY_LABELS: Record<Language, Record<string, string>> = {
  zh: {
    'All': '全部',
    'Videography': '廿四', // Renamed
    'Graphics & UI': 'OB教程',
    'Photography': '草堂', // Renamed
    'Development': '应用开发'
  },
  en: {
    'All': 'All',
    'Videography': 'Videography',
    'Graphics & UI': 'Graphics & UI',
    'Photography': 'Photography',
    'Development': 'Development'
  }
};

// 动态生成文章标签的函数
export const generateArticleLabels = (articles: Article[]) => {
  const categories = Array.from(new Set(articles.map(a => a.category)));
  const labels: Record<Language, Record<string, string>> = {
    zh: { 'All': '全部' },
    en: { 'All': 'All' }
  };

  categories.forEach(category => {
    labels.zh[category] = category; // 使用文件夹名作为标签
    labels.en[category] = category;
  });

  return labels;
};

export const PROJECTS: Record<Language, Project[]> = {
  zh: PROJECT_DATA.map(p => ({
    id: p.id,
    ...p.common,
    ...p.zh,
    // Inject bilingual title for fallback UI
    bilingualTitle: {
      zh: p.zh.title,
      en: p.en.title
    }
  })),
  en: PROJECT_DATA.map(p => ({
    id: p.id,
    ...p.common,
    ...p.en,
    // Inject bilingual title for fallback UI
    bilingualTitle: {
      zh: p.zh.title,
      en: p.en.title
    }
  }))
};

export const ARTICLES: Record<Language, Article[]> = {
  zh: ARTICLE_DATA,
  en: ARTICLE_DATA
};

// Meting API Configuration
export const METING_CONFIG = {
  // Meting API 地址
  // 默认使用官方 API，也可以使用自定义 API
  api: "https://api.i-meto.com/meting/api?server=:server&type=:type&id=:id&r=:r",
  
  // 音乐平台：netease=网易云音乐, tencent=QQ音乐, kugou=酷狗音乐, xiami=虾米音乐, baidu=百度音乐
  server: "tencent",
  
  // 类型：song=单曲, playlist=歌单, album=专辑, search=搜索, artist=艺术家
  type: "playlist",
  
  // 歌单/专辑/单曲 ID 或搜索关键词
  id: "9002792233", // 歌单ID示例
  
  // 认证 token（可选）
  auth: "",
  
  // 备用 API 配置（当主 API 失败时使用）
  fallbackApis: [
    "https://api.injahow.cn/meting/?server=:server&type=:type&id=:id",
    "https://api.moeyao.cn/meting/?server=:server&type=:type&id=:id",
  ],
  
  // MetingJS 脚本路径
  // 默认使用 CDN：https://cdn.jsdelivr.net/npm/meting@2/dist/Meting.min.js
  // 备用CDN：https://unpkg.com/meting@2/dist/Meting.min.js
  // 也可配置为本地路径
  jsPath: "https://unpkg.com/meting@2/dist/Meting.min.js",
};