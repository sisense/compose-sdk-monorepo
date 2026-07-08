export type PackageManager = 'none' | 'npm' | 'yarn' | 'pnpm';

export type CreatePluginOptions = {
  name?: string;
  template?: string;
  path?: string;
  devMode?: boolean;
  force?: boolean;
  install?: PackageManager;
};
