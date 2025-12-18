import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css';
import { generateArticleLabels } from '../constants';
import { Language, Article } from '../types';
import { useArticles } from '../src/data/articles';
import { 
  ArrowUpRight, ArrowDown, ArrowUp, BookOpen, Calendar, 
  Filter, ArrowLeft, Copy, Check, Github, Tv, MessageCircle, Rss 
} from 'lucide-react';

interface ArticleSectionProps {
  language: Language;
  startViewTransition?: (update: () => void) => void;
}

// 生成标题ID的工具函数
const generateHeadingId = (text: string) => {
  return text
    .replace(/[^\w\s\u4e00-\u9fff-]/g, '') // 保留中文字符
    .replace(/\s+/g, '-') // 空格替换为连字符
    .replace(/-+/g, '-') // 多个连字符替换为单个
    .replace(/^-|-$/g, '') // 移除开头和结尾的连字符
    .toLowerCase();
};

// 解析文章中的标题
const parseHeadings = (content: string) => {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: { level: number; text: string; id: string }[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = generateHeadingId(text);

    if (id) { // 只添加有ID的标题
      headings.push({ level, text, id });
    }
  }

  return headings;
};

// 自定义代码块组件
const CodeBlock = ({ children, className, ...props }: any) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // 正确提取代码文本内容
    const extractText = (children: any): string => {
      if (typeof children === 'string') return children;
      if (Array.isArray(children)) {
        return children.map(extractText).join('');
      }
      if (children && typeof children === 'object' && 'props' in children) {
        return extractText(children.props.children);
      }
      return String(children || '');
    };

    const text = extractText(children).replace(/\n$/, '');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className={`${className} !bg-transparent !border-0 !p-4`}>
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        title="复制代码"
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {copied ? '已复制' : '复制'}
      </button>
    </div>
  );
};

export const ArticleSection: React.FC<ArticleSectionProps> = ({ language, startViewTransition }) => {
  const [filter, setFilter] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const { articles: currentArticles, loading } = useArticles();
  const categories = ['All', ...Array.from(new Set(currentArticles.map(a => a.category)))];
  const ARTICLE_LABELS = generateArticleLabels(currentArticles);


  const filteredAndSortedArticles = currentArticles
    .filter(a => filter === 'All' || a.category === filter)
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  if (loading) {
    return (
      <div className="w-full max-w-[96vw] mx-auto pb-20 flex items-center justify-center">
        <div className="text-lg">{language === 'zh' ? '加载中...' : 'Loading...'}</div>
      </div>
    );
  }

  if (selectedArticle) {
    const headings = parseHeadings(selectedArticle.content || '');

    return (
      <div className="w-full max-w-[96vw] mx-auto pb-20">

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-4 justify-center">
          {/* Left Sidebar - Author Card and Table of Contents */}
          <div className="hidden lg:block w-64 flex-shrink-0 space-y-4">
            {/* Author Card */}
            <div className="h-[366px]">
              <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-lg h-full flex flex-col">
                {/* Avatar */}
                <div className="flex justify-center mb-2">
                  <img
                    src="https://zayck-img.pages.dev/file/1764984969206_logo.png"
                    alt="Zayck"
                    className="w-48 h-48 rounded-2xl object-cover cursor-pointer"
                    onClick={() => window.open('https://zayck-img.pages.dev/file/1764984969206_logo.png', '_blank')}
                  />
                </div>

                {/* Name */}
                <div className="text-center mb-2">
                  <h4 className="text-xl font-bold text-black dark:text-white">Zayck</h4>
                  <p className="mt-2 mb-3 text-base font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">系统 · 高效 · 实用</p>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-gray-200 dark:bg-gray-700 mb-2"></div>

                {/* Social Icons */}
                <div className="flex justify-center space-x-8 mt-auto">
                  <a
                    href="https://github.com/zayck"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-black dark:hover:text-white transition-colors"
                    title="GitHub"
                  >
                    <Github size={18} />
                  </a>
                  <a
                    href="https://space.bilibili.com/341981702"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-black dark:hover:text-white transition-colors"
                    title="Bilibili"
                  >
                    <Tv size={18} />
                  </a>
                  <a
                    href="https://mp.weixin.qq.com/mp/homepage?__biz=MzU2MTI5MzE4OA==&hid=1&sn=356f3016aeac48fc034804fca1307349&scene=18#wechat_redirect"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-black dark:hover:text-white transition-colors"
                    title="WeChat"
                  >
                    <MessageCircle size={18} />
                  </a>
                  <a
                    href="https://zayck.pages.dev/rss.xml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-black dark:hover:text-white transition-colors"
                    title="RSS"
                  >
                    <Rss size={18} />
                  </a>
                </div>
              </div>
            </div>

            {/* Table of Contents */}
            {headings.length > 0 && (
              <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
                  <BookOpen size={20} />
                  {language === 'zh' ? '目录' : 'Contents'}
                </h3>
                <div className="flex flex-col space-y-2">
                  {headings.map((heading, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const element = document.getElementById(heading.id);
                        if (element) {
                          // 添加偏移量，避免标题被导航栏遮挡
                          const offset = 100; // 像素偏移量
                          const elementPosition = element.getBoundingClientRect().top;
                          const offsetPosition = elementPosition + window.pageYOffset - offset;

                          window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                          });
                        }
                      }}
                      className={`
                        text-left px-4 py-3 rounded-lg transition-all duration-300 text-base font-medium
                        hover:bg-gray-100 dark:hover:bg-gray-800
                        ${heading.level === 1 ? 'text-black dark:text-white font-bold' : ''}
                        ${heading.level === 2 ? 'text-gray-700 dark:text-gray-300 ml-2' : ''}
                        ${heading.level >= 3 ? 'text-gray-600 dark:text-gray-400 ml-4' : ''}
                      `}
                      style={{ paddingLeft: `${(heading.level - 1) * 16 + 16}px` }}
                    >
                      {heading.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Back to List Button */}
            <div className="mt-8">
              <button
                onClick={() => setSelectedArticle(null)}
                className="flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-base font-bold w-full"
              >
                <ArrowLeft size={16} />
                {language === 'zh' ? '返回列表' : 'Back to List'}
              </button>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-grow max-w-4xl">
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg">
              {/* Article Cover Image */}
              {selectedArticle.coverImage && (
                <div className="w-full h-[386px] relative">
                  <img
                    src={selectedArticle.coverImage}
                    alt={selectedArticle.title}
                    className="w-full h-full rounded-t-xl object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  {/* Title Overlay */}
                  <div className="absolute bottom-4 left-4 bg-[rgb(80,81,78)] text-white px-4 py-2 rounded-lg shadow-lg">
                    <h1 className="text-3xl font-black leading-tight">{selectedArticle.title}</h1>
                  </div>
                </div>
              )}

              <article className="prose prose-lg dark:prose-invert max-w-none prose-table:border-collapse prose-table:border prose-table:border-gray-300 dark:prose-table:border-gray-600 prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-600 prose-th:bg-gray-50 dark:prose-th:bg-gray-800 prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-600 prose-blockquote:border-l-4 prose-blockquote:border-l-black dark:prose-blockquote:border-l-white prose-pre:!bg-transparent prose-code:!bg-gray-100 dark:prose-code:!bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded p-8">
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-8">
                  <span>{selectedArticle.date}</span>
                  <span>•</span>
                  <span>{selectedArticle.tags && selectedArticle.tags.length > 0 ? selectedArticle.tags.join(', ') : ARTICLE_LABELS[language][selectedArticle.category] || selectedArticle.category}</span>
                </div>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeRaw, rehypeKatex, rehypeHighlight]}
                  components={{
                    code: ({ node, inline, className, children, ...props }: any) => {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <CodeBlock className={className} {...props}>
                          {children}
                        </CodeBlock>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    h1: ({ children, ...props }: any) => {
                      const text = String(children || '').trim();
                      const id = generateHeadingId(text);
                      return React.createElement('h1', { id, ...props }, children);
                    },
                    h2: ({ children, ...props }: any) => {
                      const text = String(children || '').trim();
                      const id = generateHeadingId(text);
                      return React.createElement('h2', { id, ...props }, children);
                    },
                    h3: ({ children, ...props }: any) => {
                      const text = String(children || '').trim();
                      const id = generateHeadingId(text);
                      return React.createElement('h3', { id, ...props }, children);
                    },
                    h4: ({ children, ...props }: any) => {
                      const text = String(children || '').trim();
                      const id = generateHeadingId(text);
                      return React.createElement('h4', { id, ...props }, children);
                    },
                    h5: ({ children, ...props }: any) => {
                      const text = String(children || '').trim();
                      const id = generateHeadingId(text);
                      return React.createElement('h5', { id, ...props }, children);
                    },
                    h6: ({ children, ...props }: any) => {
                      const text = String(children || '').trim();
                      const id = generateHeadingId(text);
                      return React.createElement('h6', { id, ...props }, children);
                    }
                  }}
                >
                  {selectedArticle.content || ''}
                </ReactMarkdown>
              </article>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[96vw] mx-auto pb-20">

      {/* Page Title - Only show when not in article detail view */}
      {!selectedArticle && (
        <div className="mb-24 flex flex-col items-center text-center">
          <h1 className="text-[8vw] leading-none font-black mb-8 text-black dark:text-white transition-colors duration-300">
            {language === 'zh' ? '文章' : 'Articles'}
          </h1>
          <p className="text-2xl text-gray-500 dark:text-gray-400 max-w-2xl font-medium transition-colors duration-300">
            {language === 'zh' ? '个人思考、学习分享与生活记录。' : 'Thoughts, learning journey, and life records.'}
          </p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 justify-center">

        {/* Left Sidebar - Desktop */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-32">
            <h3 className="text-xl font-black mb-8 px-4 flex items-center gap-2">
              <Filter size={20} />
              {language === 'zh' ? '分类' : 'Categories'}
            </h3>
            <div className="flex flex-col space-y-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`
                    text-left px-4 py-3 rounded-xl transition-all duration-300 text-lg font-bold
                    ${filter === cat
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg transform scale-105'
                      : 'text-gray-400 hover:text-black dark:text-gray-500 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'}
                  `}
                >
                  {ARTICLE_LABELS[language][cat] || cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Filter Bar (Horizontal) */}
        <div className="lg:hidden flex overflow-x-auto pb-4 gap-4 no-scrollbar mb-8 sticky top-20 bg-white/95 dark:bg-black/95 backdrop-blur-sm z-30 pt-4">
           {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`
                whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold border-2 transition-all duration-300
                ${filter === cat
                  ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                  : 'border-gray-200 text-gray-400 dark:border-gray-800 dark:text-gray-500'}
              `}
            >
              {ARTICLE_LABELS[language][cat] || cat}
            </button>
           ))}
        </div>

        {/* Right Content Area */}
        <div className="flex-grow max-w-4xl">

          {/* Sort Controls Panel */}
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
             <div className="text-sm font-mono text-gray-400">
                {filteredAndSortedArticles.length} {language === 'zh' ? '篇文章' : 'Articles'}
             </div>

             <button
               onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
               className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-bold text-gray-600 dark:text-gray-300"
             >
                <Calendar size={16} />
                <span>{language === 'zh' ? '时间排序' : 'Date'}</span>
                {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
             </button>
          </div>

          {/* Article List - One per line */}
          <div className="flex flex-col gap-6">
            {filteredAndSortedArticles.map((article) => (
              <div
                key={article.id}
                className="group cursor-pointer"
                onClick={() => {
                  if (startViewTransition) {
                    startViewTransition(() => setSelectedArticle(article));
                  } else {
                    setSelectedArticle(article);
                  }
                }}
              >
                <div className="flex flex-col md:flex-row bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden p-2 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 items-stretch h-auto">

                    {/* Cover Image Container - Responsive aspect ratio 900:383 */}
                    <div className="w-full md:w-[45%] aspect-[900/383] shrink-0 rounded-xl overflow-hidden relative bg-gray-100 dark:bg-gray-900 transform-gpu">
                        {article.coverImage ? (
                             <img
                             src={article.coverImage}
                             alt={article.title}
                             loading="lazy"
                             decoding="async"
                             className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 will-change-transform"
                             referrerPolicy="no-referrer"
                           />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800/50">
                                 <BookOpen size={32} className="text-gray-300 dark:text-gray-600" />
                            </div>
                        )}

                        <div className="absolute top-2 left-2 bg-white/90 dark:bg-black/90 text-black dark:text-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
                          {ARTICLE_LABELS[language][article.category].split('|')[0].trim()}
                        </div>
                    </div>

                    {/* Content - Right Side */}
                    <div className="flex-grow flex flex-col p-4 md:p-6 justify-between min-w-0">
                        <div>
                            <div className="flex justify-between items-start gap-3 mb-2">
                                <h3 className="text-lg md:text-2xl font-black text-black dark:text-white leading-snug group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300 line-clamp-3">
                                    {article.title}
                                </h3>
                                <div className="bg-black dark:bg-white text-white dark:text-black p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0">
                                    <ArrowUpRight size={16} />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs md:text-sm font-mono text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800 pt-3 mt-2">
                             <span>{article.date || 'No Date'}</span>
                             <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                             <span className="truncate hidden md:inline">
                               {article.tags && article.tags.length > 0 ? article.tags.join(', ') : 'Read on WeChat'}
                             </span>
                        </div>
                    </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredAndSortedArticles.length === 0 && (
             <div className="w-full h-64 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl mt-8">
                <p className="text-xl font-medium">{language === 'zh' ? '暂无文章' : 'No articles found'}</p>
             </div>
          )}
        </div>

      </div>
    </div>
  );
};
