export const siteConfig = {
  title: 'ω',
  description: '个人博客',
  author: 'Author',
  email: 'zhourunze@foxmail.com',
  social: {
    github: 'https://github.com/zrz-taku',
  },
  basename: '/blog',
} as const;

export type SiteConfig = typeof siteConfig;
