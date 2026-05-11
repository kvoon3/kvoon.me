interface Project {
  name: string
  desc: string
  link: string
  icon: string
}

interface ProjectCategory {
  [key: string]: Project[]
}

export const projects: ProjectCategory = {
  'VS Code Plugin': [
    {
      name: 'ESLint Codemod',
      desc: 'Run eslint-plugin-command in VS Code',
      link: 'https://github.com/kvoon3/vscode-eslint-codemod',
      icon: 'ph:code-block-duotone',
    },
    {
      name: 'AutoHide KB',
      desc: 'Auto-hide VS Code UI elements',
      link: 'https://github.com/kvoon3/vscode-autohide-kb',
      icon: 'ph:app-window-duotone',
    },
    {
      name: 'Which Key Config Gen',
      desc: 'Generate VS Code Which Key config automatically',
      link: 'https://github.com/kvoon3/vscode-which-key-config-gen',
      icon: 'ph:key-duotone',
    },
  ],
}
