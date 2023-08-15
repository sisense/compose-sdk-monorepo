/* eslint-disable max-lines */
export type RoleManifest = {
  folders: {
    create: boolean;
    modify: boolean;
    delete: boolean;
    duplicate: boolean;
  };
  dashboards: {
    create: boolean;
    delete: boolean;
    move: boolean;
    rename: boolean;
    duplicate: boolean;
    change_owner: boolean;
    toggle_edit_mode: boolean;
    edit_layout: boolean;
    edit_script: boolean;
    export_dash: boolean;
    export_jpeg: boolean;
    export_image: boolean;
    export_pdf: boolean;
    share: boolean;
    restore: boolean;
    copy_to_server: boolean;
    import: boolean;
    select_palette: boolean;
    replace_datasource: boolean;
    undo_import_dash: boolean;
    toggleDataExploration: boolean;
    filters: {
      create: boolean;
      delete: boolean;
      save: boolean;
      on_off: boolean;
      toggle_expansion: boolean;
      modify: boolean;
      reorder: boolean;
      modify_type: boolean;
      toggle_auto_update: boolean;
      set_defaults: boolean;
      advanced: boolean;
      use_starred: boolean;
      modify_filter_relationship: boolean;
    };
  };
  widgets: {
    create: boolean;
    delete: boolean;
    rename: boolean;
    duplicate: boolean;
    copy_to_dashboard: boolean;
    edit: boolean;
    edit_script: boolean;
    change_type: boolean;
    export_csv: boolean;
    export_png: boolean;
    export_svg: boolean;
    export_pdf: boolean;
    modify_selection_attrs: boolean;
    modify_selection_mode: boolean;
    drill_to_anywhere: boolean;
    add_to_pulse: boolean;
    items: {
      create: boolean;
      delete: boolean;
      rename: boolean;
      modify: boolean;
      reorder: boolean;
      modify_type: boolean;
      modify_format: boolean;
      on_off: boolean;
      select_hierarchies: boolean;
    };
    filters: {
      create: boolean;
      delete: boolean;
      save: boolean;
      on_off: boolean;
      toggle_expansion: boolean;
      modify: boolean;
      modify_layout: boolean;
      modify_type: boolean;
      modify_dashboard_filters: boolean;
      use_starred: boolean;
    };
  };
  warnings: {
    revisioner: boolean;
  };
  queries: {
    impersonate: boolean;
  };
  manage: {
    users: {
      get: boolean;
      add: boolean;
      remove: boolean;
      modify: boolean;
      modify_me: boolean;
      share_invitations: boolean;
      search: boolean;
    };
    groups: {
      get: boolean;
      add: boolean;
      remove: boolean;
      modify: boolean;
      modify_mygroups: boolean;
    };
    elasticubes: {
      add: boolean;
      remove: boolean;
      modify: boolean;
      modify_rights: boolean;
      modify_rowrights: boolean;
      modify_data_security_rights: boolean;
      schedule_build: boolean;
      import: boolean;
      export: boolean;
      export_with_data: boolean;
      sql_manual_queries: {
        add: boolean;
        get: boolean;
        modify: boolean;
        remove: boolean;
      };
      custom_tables: {
        add: boolean;
        get: boolean;
        modify: boolean;
        remove: boolean;
      };
      custom_fields: {
        add: boolean;
        get: boolean;
        modify: boolean;
        remove: boolean;
      };
      table_relations: {
        add: boolean;
        get: boolean;
        modify: boolean;
        remove: boolean;
      };
      execute_build: boolean;
      get_tasks: boolean;
      get: boolean;
      manage: boolean;
      export_data: {
        client: boolean;
      };
      import_data: {
        client: boolean;
      };
      export_schema: {
        client: boolean;
      };
      import_schema: {
        client: boolean;
      };
      viewschema: boolean;
    };
    servers: {
      get: boolean;
      add: boolean;
      remove: boolean;
      modify_rights: boolean;
      get_cubes: boolean;
      cubes_info: boolean;
      cubes_status: boolean;
    };
    palettes: {
      add: boolean;
      remove: boolean;
      modify: boolean;
    };
    manage_data: boolean;
    activedirectory: boolean;
    sso: boolean;
    systemconfig: boolean;
    restapi: boolean;
    branding: boolean;
    security: boolean;
    proxy: boolean;
    translation: {
      get: boolean;
    };
    data_groups: {
      get: boolean;
      add: boolean;
      modify: boolean;
      remove: boolean;
    };
    schedule: boolean;
    connections: {
      get: boolean;
      share: boolean;
      add: boolean;
      remove: boolean;
      edit: boolean;
    };
  };
  system: {
    logs: {
      get: boolean;
      add: boolean;
      remove: boolean;
    };
  };
  reporting: {
    execute: boolean;
  };
  subscription: {
    get: boolean;
    add: boolean;
    remove: boolean;
    modify: boolean;
  };
  pages: {
    jaqleditor: boolean;
    sqleditor: boolean;
  };
  base: {
    isConsumer: boolean;
    isContributor: boolean;
    isAdmin: boolean;
    isSuper: boolean;
  };
  elasticubes: {
    sql_api: boolean;
    check_users_permission: boolean;
  };
  usageAnalytics: {
    base: boolean;
    extended: boolean;
  };
  warehouse: {
    add_warehouse: boolean;
    create_view: boolean;
  };
  nlq: {
    createSpec: boolean;
    updateSpec: boolean;
    initSpec: boolean;
  };
  'user-parameters': {
    read: boolean;
    write: boolean;
  };
  notebooks: {
    read: boolean;
    export_csv: boolean;
    edit: boolean;
    own: boolean;
    admin: boolean;
  };
  tenants: {
    crossTenant: boolean;
  };
  pulse: {
    edit_script: boolean;
  };
};
