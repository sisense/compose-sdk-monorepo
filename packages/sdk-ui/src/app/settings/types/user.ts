import { RoleManifest } from './role-manifest.js';

export type User = {
  _id: string;
  roleManifest: RoleManifest;
  userAuth: RoleManifest;
  tenant: Tenant;
  groupsName: { id: string; name: string }[];
  active: boolean;
  roleId: string;
  created: string;
  lastUpdated: string;
  manifest: Record<string, unknown>;
  tenantId: string;
  groups: string[];
  internalGroups: string[];
  default: boolean;
  email: string;
  firstName: string;
  lastName: string;
  preferences: Record<string, unknown>;
  userName: string;
  lastLogin: string;
  lastActivity: string;
  uiSettings: UISettings;
  roleName: string;
  baseRoleName: string;
  isSystemTenantAdmin: boolean;
  allowedTenants: string[];
  preferredLanguage: string;
};

type Tenant = {
  _id: string;
  name: string;
  default: boolean;
};

type UISettings = {
  ecmNext: {
    dataPage: {
      hideListViewGuider: boolean;
    };
    guidersShown: {
      ecActions: boolean;
      addData: boolean;
      dashboards: boolean;
    };
  };
};
