import { LegacyDesignSettings } from '../../../themes/legacy-design-settings.js';
import { Brand } from './brand.js';
import { DeploymentProps } from './deployment-props.js';
import { EcmProps } from './ecm-props.js';
import { Features } from './features.js';
import { Globalization } from './globalization.js';
import { User } from './user.js';

export type GlobalsObject = {
  platform: string;
  user: User;
  brand: Brand;
  designSettings: LegacyDesignSettings;
  app: string;
  appData: {
    isDemo: boolean;
  };
  props: DeploymentProps;
  cdnURL: string;
  versionHash: string;
  version: string;
  globalization: Globalization;
  firstday: string;
  isBrandingDisabled: boolean;
  features: Features;
  favicon: string;
  language: string;
  locale: string;
  messages: Record<string, string>;
  env: string;
  proxyurl: string;
  socketUrl: string;
  ecmProps: EcmProps;
};
