import { Language } from '../../types';

export interface SocialLinks {
  wechat: string;
  xiaohongshu: string;
  bilibili: string;
  px500: string;
}

export interface ContactContent {
  baseLabel: string;
  locationValue: string;
  contactLabel: string;
  emailMeLabel: string;
  email: string;
  hello: string;
  intro: string;
  socials: SocialLinks;
  tooltip?: string;
  githubLabel: string;
  footerDesign: string;
}

export const CONTACT_DATA: Record<Language, ContactContent> = {
  zh: {
    baseLabel: "BASE",
    locationValue: "广东，东莞",
    contactLabel: "取得联系",
    emailMeLabel: "邮箱",
    email: "savaii@163.com",
    hello: "你好 ;-)",
    intro: "欢迎探讨与合作。",
    socials: {
      wechat: "少阳研究所",
      xiaohongshu: "少阳手记",
      bilibili: "Zayck-少阳",
      px500: "Zayck' Blog"
    },
    githubLabel: "GitHub",
    footerDesign: "Powered by Gemini 3 Pro"
  },
  en: {
    baseLabel: "BASE",
    locationValue: "Dongguan, Guangdong",
    contactLabel: "Get in touch",
    emailMeLabel: "Email Me",
    email: "savaii@163.com",
    hello: "Hello ;-)",
    intro: "Welcome to discuss & cooperate.",
    socials: {
      wechat: "少阳研究所",
      xiaohongshu: "少阳手记",
      bilibili: "Zayck-少阳",
      px500: "Zayck' Blog"
    },
    githubLabel: "GitHub",
    footerDesign: "Powered by Gemini 3 Pro"
  }
};
