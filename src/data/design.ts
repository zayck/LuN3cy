import { Project } from '../../types';

export const DESIGN_DATA: Project[] = [
  {
    id: 'd1',
    common: {
      category: 'Graphics & UI',
      image: 'https://zayck-img.pages.dev/file/来自新世界/1765117938736_20131106134412_8n3fT.png',
      figmaUrl: '', 
      gallery: [
        'https://picsum.photos/800/600?random=11',
        'https://picsum.photos/800/600?random=12',
        'https://picsum.photos/800/600?random=13'
      ]
    },
    zh: {
      title: '序言',
      subtitle: '123',
      description: '2',
      role: 'd',
      tags: ['a', 'b', 'c'],
      awards: ["text2"],
      concept: "text1",
      roleDetail: "text"
    },
    en: {
      title: 'foreword',
      subtitle: '123',
      description: '2',
      role: 'd',
      tags: ['a', 'b', 'c'],
      awards: ["text2"],
      concept: "text1",
      roleDetail: "text"
    }
  },
];
