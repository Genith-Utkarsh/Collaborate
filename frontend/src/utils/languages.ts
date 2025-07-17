// Language color utility function
export function getLanguageClass(language: string): string {
  const lang = language.toLowerCase();
  
  const languageMap: { [key: string]: string } = {
    javascript: 'lang-javascript',
    typescript: 'lang-typescript',
    python: 'lang-python',
    java: 'lang-java',
    react: 'lang-react',
    vue: 'lang-vue',
    angular: 'lang-angular',
    'node.js': 'lang-nodejs',
    nodejs: 'lang-nodejs',
    'c++': 'lang-cpp',
    cpp: 'lang-cpp',
    'c#': 'lang-csharp',
    csharp: 'lang-csharp',
    php: 'lang-php',
    go: 'lang-go',
    rust: 'lang-rust',
    swift: 'lang-swift',
    kotlin: 'lang-kotlin',
    dart: 'lang-dart',
    ruby: 'lang-ruby',
    sql: 'lang-sql',
    html: 'lang-html',
    css: 'lang-css',
    sass: 'lang-sass',
    scss: 'lang-sass',
    mongodb: 'lang-mongodb',
    mysql: 'lang-mysql',
    postgresql: 'lang-postgresql',
    docker: 'lang-docker',
    kubernetes: 'lang-kubernetes',
    aws: 'lang-aws',
    tensorflow: 'lang-tensorflow',
    pytorch: 'lang-pytorch',
    flutter: 'lang-flutter'
  };
  
  return languageMap[lang] || 'lang-default';
}

// Common programming language colors for display
export const languageColors: { [key: string]: string } = {
  javascript: '#f7df1e',
  typescript: '#3178c6',
  python: '#3776ab',
  java: '#ed8b00',
  react: '#61dafb',
  vue: '#4fc08d',
  angular: '#dd0031',
  nodejs: '#339933',
  cpp: '#00599c',
  csharp: '#239120',
  php: '#777bb4',
  go: '#00add8',
  rust: '#000000',
  swift: '#fa7343',
  kotlin: '#0095d5',
  dart: '#0175c2',
  ruby: '#cc342d',
  sql: '#336791',
  html: '#e34f26',
  css: '#1572b6',
  sass: '#cf649a'
};
