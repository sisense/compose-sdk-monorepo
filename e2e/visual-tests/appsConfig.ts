import { type FullConfig } from '@playwright/test';

type TestConfigWebServer = NonNullable<FullConfig['webServer']>;
type AppName = string;
type AppsConfig = Record<AppName, TestConfigWebServer>;

export enum AppsNames {
  REACT_DEMO = 'reactDemo',
  REACT_LOCAL_DEMO = 'reactLocalDemo',
  REACT_STORYBOOK = 'reactStorybook',
  VUE_DEMO = 'vueDemo',
  ANGULAR_DEMO = 'angularDemo',
}

const host = process.env.USE_EXTERNAL_HOST ? 'host.docker.internal' : 'localhost';

const appsConfig: AppsConfig = {
  [AppsNames.REACT_DEMO]: {
    command: 'yarn workspace react-ts-demo dev --port 5300',
    url: `http://${host}:5300`,
  },
  [AppsNames.REACT_LOCAL_DEMO]: {
    command: 'yarn workspace @sisense/sdk-ui dev --port 5301',
    url: `http://${host}:5301`,
  },
  [AppsNames.REACT_STORYBOOK]: {
    command: 'yarn workspace @sisense/sdk-ui storybook --port 5302',
    url: `http://${host}:5302`,
  },
  [AppsNames.VUE_DEMO]: {
    command: 'yarn workspace vue-ts-demo dev --port 5303',
    url: `http://${host}:5303`,
  },
  [AppsNames.ANGULAR_DEMO]: {
    command:
      'node ./scripts/configure-angular-demo-env.cjs && yarn workspace angular-demo start --port 5304',
    url: `http://${host}:5304`,
  },
};

const normalizeAppConfig = (app: Partial<TestConfigWebServer>) => {
  return {
    timeout: 2 * 60 * 1000,
    reuseExistingServer: !process.env.CI,
    env: {
      VITE_APP_SISENSE_URL: process.env.E2E_SISENSE_URL,
      VITE_APP_SISENSE_TOKEN: process.env.E2E_SISENSE_TOKEN,
    },
    ...app,
  } as TestConfigWebServer;
};

export const getAppConfig = (appName: AppName) => {
  const config = appsConfig[appName];

  if (!config) {
    throw new Error(`No configuration exists for app with name '${appName}'`);
  }

  return normalizeAppConfig(config);
};

export const getAppsConfig = () => {
  return Object.values<TestConfigWebServer>(appsConfig).map((config) => normalizeAppConfig(config));
};
