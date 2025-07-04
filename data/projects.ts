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
      name: 'ESLint Codemod',
      desc: 'Supercharge eslint-plugin-command in VS Code',
      link: 'https://github.com/kvoon3/vscode-eslint-codemod',
      icon: 'pixelarticons:code',
    },
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
      icon: 'pixelarticons:reciept',
    },
  ],
}
