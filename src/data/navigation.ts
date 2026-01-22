import { Language } from '../../types';

export const NAV_ITEMS: Record<Language, { id: string; label: string }[]> = {
  zh: [
    { id: 'shao-yang-notes', label: '少阳手记' },
    { id: 'shao-yang-institute', label: '少阳研究所' },
    { id: 'portfolio', label: '作品' },
    { id: 'about', label: '教育' },
    { id: 'contact', label: '联系' }
  ],
  en: [
    { id: 'shao-yang-notes', label: 'Notes' },
    { id: 'shao-yang-institute', label: 'Institute' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'about', label: 'Education' },
    { id: 'contact', label: 'Contact' }
  ]
};
