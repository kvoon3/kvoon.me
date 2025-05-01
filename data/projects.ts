export interface Project {
  name: string
  desc: string
  link: string
  icon: string
}

export interface ProjectCategory {
  [key: string]: Project[]
}

export const projects: ProjectCategory = {
  'VSCode Plugin': [
    {
      name: 'AutoHide KB',
      desc: 'Auto Hide VSCode sidebar, panel and notifications.',
      link: 'https://github.com/kvoon3/vscode-autohide-kb',
      icon: 'pixelarticons:keyboard',
    },
    {
      name: 'Which Key Config Gen',
      desc: 'Generate vscode which-key config automatically',
      link: 'https://github.com/kvoon3/vscode-which-key-config-gen',
      icon: 'pixelarticons:code',
    },
  ],
  'CSS': [
    {
      name: 'vimium-theme-vitesse',
      desc: 'Vitesse theme for Vimium',
      link: 'https://github.com/kvoon3/vimium-theme-vitesse',
      icon: 'pixelarticons:paint-bucket',
    },
  ],
  'Start Template': [
    {
      name: 'Carapace',
      desc: 'Vue 2.7 starter template',
      link: 'https://github.com/kvoon3/carapace',
      icon: 'pixelarticons:downasaur',
    },
  ],
  'UserScript': [
    {
      name: 'bili-cleaner',
      desc: 'Clean up Bilibili resource quickly',
      link: 'https://github.com/kvoon3/bili-cleaner',
      icon: 'pixelarticons:video',
    },
  ],
  'Library': [
    {
      name: 'UnMap',
      desc: 'A Map SDK wrapper for unify experience',
      link: 'https://github.com/kvoon3/UnMap',
      icon: 'pixelarticons:map',
    },
    {
      name: 'zod-arco-rules',
      desc: 'Zod validation rules for Arco Design',
      link: 'https://github.com/kvoon3/zod-arco-rules',
      icon: 'pixelarticons:code',
    },
  ],
  'Tools': [
    {
      name: 'Img Min Toolkit',
      desc: 'Compress images in batches at the terminal',
      link: 'https://github.com/kvoon3/img-min-toolkit',
      icon: 'pixelarticons:image',
    },
  ],
}
