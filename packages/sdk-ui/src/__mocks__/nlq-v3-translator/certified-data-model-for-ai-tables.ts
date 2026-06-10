import type { NormalizedTable } from '@/modules/analytics-composer/index-node.js';

/**
 * Full mock schema for `certified_data_model_for_ai` (live NLQ demo).
 * Mirrors API dataSchema.tables — all tables and columns from the certified model.
 */
export const CERTIFIED_DATA_MODEL_FOR_AI_TABLES: NormalizedTable[] = [
  {
    name: 'AGG_CUBES_ALL_ACTIVITY_DAILY',
    columns: [
      {
        name: 'ACCOUNT_ID',
        dataType: 'text',
        expression: '[AGG_CUBES_ALL_ACTIVITY_DAILY.ACCOUNT_ID]',
        description: 'Unique identifier for accounts',
      },
      {
        name: 'BUILD_DESTINATION',
        dataType: 'text',
        expression: '[AGG_CUBES_ALL_ACTIVITY_DAILY.BUILD_DESTINATION]',
        description: 'Storage destination on this date.',
      },
      {
        name: 'BUILD_DESTINATION_TYPE',
        dataType: 'text',
        expression: '[AGG_CUBES_ALL_ACTIVITY_DAILY.BUILD_DESTINATION_TYPE]',
        description: "Cube/data model type on this date ('elasticube', 'b2d', 'live').",
      },
      {
        name: 'CUBE_NAME',
        dataType: 'text',
        expression: '[AGG_CUBES_ALL_ACTIVITY_DAILY.CUBE_NAME]',
        description: 'Data model name',
      },
      {
        name: 'CUBE_SIZE_GB',
        dataType: 'numeric',
        expression: '[AGG_CUBES_ALL_ACTIVITY_DAILY.CUBE_SIZE_GB]',
        description: 'Cube storage size (GB) on this date.',
      },
      {
        name: 'DEPLOYMENT_ID',
        dataType: 'text',
        expression: '[AGG_CUBES_ALL_ACTIVITY_DAILY.DEPLOYMENT_ID]',
        description: 'Deployment GUID where data model exists',
      },
      {
        name: 'DTE',
        dataType: 'datetime',
        expression: '[AGG_CUBES_ALL_ACTIVITY_DAILY.DTE (Calendar)]',
        description: 'Date of the metrics. Use for time-series filtering and aggregation.',
      },
      {
        name: 'LAST_BUILD_STATUS',
        dataType: 'text',
        expression: '[AGG_CUBES_ALL_ACTIVITY_DAILY.LAST_BUILD_STATUS]',
        description: "Final build status for this cube on this date ('success', 'failed', 'N/A').",
      },
      {
        name: 'LICENSE_ID',
        dataType: 'text',
        expression: '[AGG_CUBES_ALL_ACTIVITY_DAILY.LICENSE_ID]',
        description: 'Unique identifier for licenses',
      },
      {
        name: 'MAX_DURATION_BUILDS_SECONDS_BUILT',
        dataType: 'numeric',
        expression: '[AGG_CUBES_ALL_ACTIVITY_DAILY.MAX_DURATION_BUILDS_SECONDS_BUILT]',
        description: 'Longest build duration for this cube on this date.',
      },
      {
        name: 'MAX_NUM_OF_TABLES_BUILT',
        dataType: 'numeric',
        expression: '[AGG_CUBES_ALL_ACTIVITY_DAILY.MAX_NUM_OF_TABLES_BUILT]',
        description: 'Max tables built in a single build for this cube on this date.',
      },
      {
        name: 'MAX_QUERIES_DURATION_FAILURE',
        dataType: 'numeric',
        expression: '[AGG_CUBES_ALL_ACTIVITY_DAILY.MAX_QUERIES_DURATION_FAILURE]',
        description: 'Longest failed query for this cube on this date.',
      },
      {
        name: 'MAX_QUERIES_DURATION_SUCCESS',
        dataType: 'numeric',
        expression: '[AGG_CUBES_ALL_ACTIVITY_DAILY.MAX_QUERIES_DURATION_SUCCESS]',
        description: 'Longest successful query for this cube on this date.',
      },
      {
        name: 'MAX_ROWS_BUILT',
        dataType: 'numeric',
        expression: '[AGG_CUBES_ALL_ACTIVITY_DAILY.MAX_ROWS_BUILT]',
        description: 'Max rows in a single build for this cube on this date.',
      },
      {
        name: 'TOTAL_BUILDS_CANCELLED',
        dataType: 'numeric',
        expression: '[AGG_CUBES_ALL_ACTIVITY_DAILY.TOTAL_BUILDS_CANCELLED]',
        description: 'Cancelled builds for this cube on this date.',
      },
      {
        name: 'TOTAL_BUILDS_DURATION_SECONDS',
        dataType: 'numeric',
        expression: '[AGG_CUBES_ALL_ACTIVITY_DAILY.TOTAL_BUILDS_DURATION_SECONDS]',
        description: 'Total build time (seconds) for this cube on this date.',
      },
      {
        name: 'TOTAL_BUILDS_FAILED',
        dataType: 'numeric',
        expression: '[AGG_CUBES_ALL_ACTIVITY_DAILY.TOTAL_BUILDS_FAILED]',
        description: 'Failed builds for this cube on this date.',
      },
      {
        name: 'TOTAL_BUILDS_SUCCESS',
        dataType: 'numeric',
        expression: '[AGG_CUBES_ALL_ACTIVITY_DAILY.TOTAL_BUILDS_SUCCESS]',
        description: 'Successful builds for this cube on this date.',
      },
      {
        name: 'TOTAL_FAILURE_QUERIES_BYTES',
        dataType: 'numeric',
        expression: '[AGG_CUBES_ALL_ACTIVITY_DAILY.TOTAL_FAILURE_QUERIES_BYTES]',
        description: 'Bytes in failed queries for this cube on this date.',
      },
      {
        name: 'TOTAL_FAILURE_QUERIES_ROWS',
        dataType: 'numeric',
        expression: '[AGG_CUBES_ALL_ACTIVITY_DAILY.TOTAL_FAILURE_QUERIES_ROWS]',
        description: 'Rows in failed queries for this cube on this date.',
      },
      {
        name: 'TOTAL_NUM_OF_TABLES_BUILT',
        dataType: 'numeric',
        expression: '[AGG_CUBES_ALL_ACTIVITY_DAILY.TOTAL_NUM_OF_TABLES_BUILT]',
        description: 'Total tables built across all builds for this cube on this date.',
      },
      {
        name: 'TOTAL_QUERIES_DURATION_FAILURE',
        dataType: 'numeric',
        expression: '[AGG_CUBES_ALL_ACTIVITY_DAILY.TOTAL_QUERIES_DURATION_FAILURE]',
        description: 'Total duration (seconds) of failed queries for this cube on this date.',
      },
      {
        name: 'TOTAL_QUERIES_DURATION_SUCCESS',
        dataType: 'numeric',
        expression: '[AGG_CUBES_ALL_ACTIVITY_DAILY.TOTAL_QUERIES_DURATION_SUCCESS]',
        description: 'Total duration (seconds) of successful queries for this cube on this date.',
      },
      {
        name: 'TOTAL_QUERIES_FAILURE',
        dataType: 'numeric',
        expression: '[AGG_CUBES_ALL_ACTIVITY_DAILY.TOTAL_QUERIES_FAILURE]',
        description: 'Failed queries against this cube on this date.',
      },
      {
        name: 'TOTAL_QUERIES_SUCCESS',
        dataType: 'numeric',
        expression: '[AGG_CUBES_ALL_ACTIVITY_DAILY.TOTAL_QUERIES_SUCCESS]',
        description: 'Successful queries against this cube on this date.',
      },
      {
        name: 'TOTAL_ROWS_BUILT',
        dataType: 'numeric',
        expression: '[AGG_CUBES_ALL_ACTIVITY_DAILY.TOTAL_ROWS_BUILT]',
        description: 'Total rows processed in builds for this cube on this date.',
      },
      {
        name: 'TOTAL_SUCCESS_QUERIES_BYTES',
        dataType: 'numeric',
        expression: '[AGG_CUBES_ALL_ACTIVITY_DAILY.TOTAL_SUCCESS_QUERIES_BYTES]',
        description: 'Bytes processed by successful queries for this cube on this date.',
      },
      {
        name: 'TOTAL_SUCCESS_QUERIES_ROWS',
        dataType: 'numeric',
        expression: '[AGG_CUBES_ALL_ACTIVITY_DAILY.TOTAL_SUCCESS_QUERIES_ROWS]',
        description: 'Total rows returned by successful queries for this cube on this date.',
      },
      {
        name: 'UNIQUE_CUBE_COUNT_KEY',
        dataType: 'text',
        expression: '[AGG_CUBES_ALL_ACTIVITY_DAILY.UNIQUE_CUBE_COUNT_KEY]',
        description:
          'Primary key for counting cubes/data models. Uses unique_cube_identifier if available, otherwise cube_identifier_by_cube_name. Always use this column for COUNT DISTINCT operations on cubes.',
      },
      {
        name: 'WAS_BUILT',
        dataType: 'text',
        expression: '[AGG_CUBES_ALL_ACTIVITY_DAILY.WAS_BUILT]',
        description: 'TRUE = this cube had at least one build on this date.',
      },
      {
        name: 'WAS_QUERIED',
        dataType: 'text',
        expression: '[AGG_CUBES_ALL_ACTIVITY_DAILY.WAS_QUERIED]',
        description: 'TRUE = this cube was queried on this date.',
      },
    ],
  },
  {
    name: 'DIM_ACCOUNT',
    columns: [
      {
        name: 'ACCOUNT_ID',
        dataType: 'text',
        expression: '[DIM_ACCOUNT.ACCOUNT_ID]',
        description:
          'Unique identifier for each account, used for linking and referencing accounts across datasets.',
      },
      {
        name: 'ACCOUNT_STATUS',
        dataType: 'text',
        expression: '[DIM_ACCOUNT.ACCOUNT_STATUS]',
        description:
          'Indicates the current relationship status with Sisense, such as Prospect, Customer, Partner, Onboarding, Pending Churn, etc.',
      },
      {
        name: 'ACCOUNT_TYPE',
        dataType: 'text',
        expression: '[DIM_ACCOUNT.ACCOUNT_TYPE]',
        description:
          'Indicates the current account type: SLG (paying customers, available in SFDC), Trial (PLG, signed up accounts), Converted (converted from Trial/PLG to paying/SLG), Internal Production (intrenal Sisense accounts, like SIBI)',
      },
      {
        name: 'ACTIVE_CLOUD_OPPORTUNITIES',
        dataType: 'numeric',
        expression: '[DIM_ACCOUNT.ACTIVE_CLOUD_OPPORTUNITIES]',
        description:
          'Count of active cloud-related opportunities for the account, used to assess cloud service engagement.',
      },
      {
        name: 'ACTIVE_CUSTOMER',
        dataType: 'text',
        expression: '[DIM_ACCOUNT.ACTIVE_CUSTOMER]',
        description:
          'Indicates whether a customer is currently active, used for customer engagement strategies.',
      },
      {
        name: 'ACV',
        dataType: 'numeric',
        expression: '[DIM_ACCOUNT.ACV]',
        description:
          'Annual Contract Value representing the yearly revenue from the account, used in financial forecasting.',
      },
      {
        name: 'AE_NAME',
        dataType: 'text',
        expression: '[DIM_ACCOUNT.AE_NAME]',
        description:
          'Name of the account executive associated with the account, used for relationship management.',
      },
      {
        name: 'CDT_CUSTOMER_LEGACY',
        dataType: 'text',
        expression: '[DIM_ACCOUNT.CDT_CUSTOMER_LEGACY]',
        description:
          'Identifies if a customer is part of the legacy system, used for data migration and integration processes.',
      },
      {
        name: 'CHURN_DATE',
        dataType: 'datetime',
        expression: '[DIM_ACCOUNT.CHURN_DATE (Calendar)]',
        description:
          'Date when churn occurs with daily granularity from 2020, used to analyze customer retention and churn rates.',
      },
      {
        name: 'CLOUD_VENDOR',
        dataType: 'text',
        expression: '[DIM_ACCOUNT.CLOUD_VENDOR]',
        description:
          'The specific Cloud Service Provider (e.g., AWS, Azure, Google Cloud). Use ONLY for the questions about the vendor/cloud provider name.',
      },
      {
        name: 'CONTRACT_END_DATE',
        dataType: 'datetime',
        expression: '[DIM_ACCOUNT.CONTRACT_END_DATE (Calendar)]',
        description:
          'Date when the contract ends with daily granularity from 2025, used to track contract expiration and renewals.',
      },
      {
        name: 'CONTRACT_START_DATE',
        dataType: 'datetime',
        expression: '[DIM_ACCOUNT.CONTRACT_START_DATE (Calendar)]',
        description:
          'Date when the contract begins with daily granularity from 2011, used to analyze contract lifecycles.',
      },
      {
        name: 'COUNTRY',
        dataType: 'text',
        expression: '[DIM_ACCOUNT.COUNTRY]',
        description:
          'Country where the account is located, used for geographical analysis and segmentation.',
      },
      {
        name: 'CSM_NAME',
        dataType: 'text',
        expression: '[DIM_ACCOUNT.CSM_NAME]',
        description:
          'Name of the Customer Success Manager for the account, used for relationship management.',
      },
      {
        name: 'CSM_USER_ID',
        dataType: 'text',
        expression: '[DIM_ACCOUNT.CSM_USER_ID]',
        description:
          'Unique identifier for the Customer Success Manager associated with the account, used for tracking and management.',
      },
      {
        name: 'CUSTOMER_AGE_DAYS',
        dataType: 'numeric',
        expression: '[DIM_ACCOUNT.CUSTOMER_AGE_DAYS]',
        description:
          'Age of the customer account in days, used for lifecycle analysis and customer segmentation.',
      },
      {
        name: 'DAYS_UNTIL_END_OF_CONTRACT',
        dataType: 'numeric',
        expression: '[DIM_ACCOUNT.DAYS_UNTIL_END_OF_CONTRACT]',
        description:
          'Number of days remaining until the end of the contract, used for contract management and renewal planning.',
      },
      {
        name: 'EFFECTIVE_ARR',
        dataType: 'numeric',
        expression: '[DIM_ACCOUNT.EFFECTIVE_ARR]',
        description:
          'Should be used as the primary field when evaluating revenue. Effective Annual Recurring Revenue from the account, used to measure predictable revenue streams.',
      },
      {
        name: 'ENTERPRISE_ELITE_SERVICE',
        dataType: 'numeric',
        expression: '[DIM_ACCOUNT.ENTERPRISE_ELITE_SERVICE]',
        description:
          'Count of enterprise elite services utilized by the account, used to evaluate premium service adoption.',
      },
      {
        name: 'INDUSTRY',
        dataType: 'text',
        expression: '[DIM_ACCOUNT.INDUSTRY]',
        description:
          "Industry classification of the account with illustrative values like 'Healthcare' and 'Finance', used for market analysis.",
      },
      {
        name: 'IS_CONTROL_PLANE',
        dataType: 'text',
        expression: '[DIM_ACCOUNT.IS_CONTROL_PLANE]',
        description: 'Boolean indicator to identify if the account exists in the Control Plane',
      },
      {
        name: 'LATEST_NPS_SCORE',
        dataType: 'numeric',
        expression: '[DIM_ACCOUNT.LATEST_NPS_SCORE]',
        description:
          'Latest Net Promoter Score reflecting customer satisfaction and loyalty, used for customer experience analysis.',
      },
      {
        name: 'NAME',
        dataType: 'text',
        expression: '[DIM_ACCOUNT.NAME]',
        description:
          "Name of the customer with illustrative values like 'Acme Corp' and 'Global Solutions Inc.', used for identification and reporting.",
      },
      {
        name: 'NATURAL_LANGUAGE_PACKAGE',
        dataType: 'numeric',
        expression: '[DIM_ACCOUNT.NATURAL_LANGUAGE_PACKAGE]',
        description:
          'Count of natural language processing packages utilized by the account, used to assess technology adoption.',
      },
      {
        name: 'NUMBER_ACTIVE_CDT_PRODUCTS',
        dataType: 'numeric',
        expression: '[DIM_ACCOUNT.NUMBER_ACTIVE_CDT_PRODUCTS]',
        description:
          'Count of active CDT products associated with the account, used for product usage analysis.',
      },
      {
        name: 'NUMBER_OF_OPEN_EXPANSION_OPPS',
        dataType: 'numeric',
        expression: '[DIM_ACCOUNT.NUMBER_OF_OPEN_EXPANSION_OPPS]',
        description:
          'Number of open opportunities for account expansion, used to evaluate growth potential.',
      },
      {
        name: 'NUMBER_OF_RENEWALS',
        dataType: 'numeric',
        expression: '[DIM_ACCOUNT.NUMBER_OF_RENEWALS]',
        description:
          'Count of contract renewals for the account, used to assess customer retention and engagement.',
      },
      {
        name: 'NUMBEROFEMPLOYEES',
        dataType: 'numeric',
        expression: '[DIM_ACCOUNT.NUMBEROFEMPLOYEES]',
        description:
          'Total number of employees in the account, used for workforce analysis and resource planning.',
      },
      {
        name: 'OPEN_EXPANSION_ARR',
        dataType: 'numeric',
        expression: '[DIM_ACCOUNT.OPEN_EXPANSION_ARR]',
        description:
          'Annual Recurring Revenue from open expansion opportunities, used to evaluate potential revenue growth.',
      },
      {
        name: 'OPEN_NEW_BUSINESS_OPPORTUNITIES',
        dataType: 'numeric',
        expression: '[DIM_ACCOUNT.OPEN_NEW_BUSINESS_OPPORTUNITIES]',
        description:
          'Number of new business opportunities identified for the account, used to track sales pipeline growth.',
      },
      {
        name: 'PRIMARY_PROJECT_TYPE',
        dataType: 'text',
        expression: '[DIM_ACCOUNT.PRIMARY_PROJECT_TYPE]',
        description:
          'Indicates the primary project type associated with the account, such as OEM Analytics, Direct Analytics, or Cloud Data Teams. Should be used when asking about OEM or Direct usage/customers.',
      },
      {
        name: 'REGION',
        dataType: 'text',
        expression: '[DIM_ACCOUNT.REGION]',
        description:
          'Geographical region of the account (such as US, Intl), used for regional analysis and reporting.',
      },
      {
        name: 'SERVICES',
        dataType: 'numeric',
        expression: '[DIM_ACCOUNT.SERVICES]',
        description: 'The Total Price of all Services Products in Active Opportunities',
      },
      {
        name: 'TAM_USER_ID',
        dataType: 'text',
        expression: '[DIM_ACCOUNT.TAM_USER_ID]',
        description:
          'Unique identifier for the TAM (Technical Account Manager) user linked to the account, used to join and filter by assigned TAM.',
      },
      {
        name: 'TAM_USER_NAME',
        dataType: 'text',
        expression: '[DIM_ACCOUNT.TAM_USER_NAME]',
        description:
          'Display name of the TAM (Technical Account Manager) assigned to the account, used for human-readable TAM reporting.',
      },
      {
        name: 'USE_CASE_TYPE',
        dataType: 'text',
        expression: '[DIM_ACCOUNT.USE_CASE_TYPE]',
        description:
          'Indicates whether the product use case is embedded or non-embedded, based on Salesforce data.',
      },
      {
        name: 'X1ST_CLOSE_DATE',
        dataType: 'datetime',
        expression: '[DIM_ACCOUNT.X1ST_CLOSE_DATE (Calendar)]',
        description:
          'Date of the first closure event with daily granularity from 2010, used to evaluate closure timelines.',
      },
    ],
  },
  {
    name: 'DIM_ACCOUNT_DETAILS',
    columns: [
      {
        name: 'ACCOUNT_ID',
        dataType: 'text',
        expression: '[DIM_ACCOUNT_DETAILS.ACCOUNT_ID]',
        description:
          'Unique identifier for each account, used for linking account-related data across systems.',
      },
      {
        name: 'IS_USAGE_REPORTED',
        dataType: 'text',
        expression: '[DIM_ACCOUNT_DETAILS.IS_USAGE_REPORTED]',
        description:
          'Indicates whether account usage has been reported, used for tracking and reporting purposes.',
      },
      {
        name: 'OS',
        dataType: 'text',
        expression: '[DIM_ACCOUNT_DETAILS.OS]',
        description:
          "Indicates the operating system used by the account, with illustrative values like 'Linux' and 'Windows'.",
      },
      {
        name: 'PRODUCT',
        dataType: 'text',
        expression: '[DIM_ACCOUNT_DETAILS.PRODUCT]',
        description:
          "Specifies the product associated with the account, with illustrative values like 'cdt' and 'fusion'.",
      },
      {
        name: 'PRODUCT_HOSTING_LOCATION',
        dataType: 'text',
        expression: '[DIM_ACCOUNT_DETAILS.PRODUCT_HOSTING_LOCATION]',
        description:
          "Primary field identifying the customer's hosting location and deployment type: Is the customer a Cloud customer (hosted and managed by Sisense) or an On-Prem/Self-Hosted customer? Data sourced from Salesforce.",
      },
    ],
  },
  {
    name: 'DIM_CONTACT',
    columns: [
      {
        name: 'ACCOUNT_ID',
        dataType: 'text',
        expression: '[DIM_CONTACT.ACCOUNT_ID]',
        description:
          'Identifier for the account associated with the contact, used for linking contacts to their respective accounts.',
      },
      {
        name: 'CONTACT_CREATED_DATE',
        dataType: 'datetime',
        expression: '[DIM_CONTACT.CONTACT_CREATED_DATE (Calendar)]',
        description:
          'Timestamp of when the contact was created with second granularity from 2012, used for tracking contact lifecycle and engagement metrics.',
      },
      {
        name: 'CONTACT_EMAIL',
        dataType: 'text',
        expression: '[DIM_CONTACT.CONTACT_EMAIL]',
        description: 'Email address of the contact, used for communication and outreach purposes.',
      },
      {
        name: 'CONTACT_ID',
        dataType: 'text',
        expression: '[DIM_CONTACT.CONTACT_ID]',
        description:
          'Unique identifier for each contact, used for linking and referencing contacts across datasets.',
      },
      {
        name: 'CONTACT_TYPE__C',
        dataType: 'text',
        expression: '[DIM_CONTACT.CONTACT_TYPE__C]',
        description:
          "Classification of the contact's role or type, used for categorization and targeted communication strategies.",
      },
      {
        name: 'FULL_NAME',
        dataType: 'text',
        expression: '[DIM_CONTACT.FULL_NAME]',
        description:
          'Complete name of the contact, used for identification and personalization in communications.',
      },
      {
        name: 'ISDELETED',
        dataType: 'text',
        expression: '[DIM_CONTACT.ISDELETED]',
        description:
          'Indicates whether a contact record has been marked as deleted, used for data integrity and record management.',
      },
      {
        name: 'LASTNAME',
        dataType: 'text',
        expression: '[DIM_CONTACT.LASTNAME]',
        description:
          'Last name of the contact, used for sorting and filtering contacts in various applications.',
      },
    ],
  },
  {
    name: 'DIM_CUBES',
    columns: [
      {
        name: 'ACCOUNT_ID',
        dataType: 'text',
        expression: '[DIM_CUBES.ACCOUNT_ID]',
        description: 'Unique identifier for accounts',
      },
      {
        name: 'BUILD_DESTINATION',
        dataType: 'text',
        expression: '[DIM_CUBES.BUILD_DESTINATION]',
        description:
          "Where cube data is curently stored: 'monetdb' (ElastiCube), 'snowflake', 'redshift', 'live'.",
      },
      {
        name: 'BUILD_DESTINATION_TYPE',
        dataType: 'text',
        expression: '[DIM_CUBES.BUILD_DESTINATION_TYPE]',
        description:
          "Current data model type classification: 'elasticube' = traditional ElastiCube (data imported), 'b2d' = Build-to-Dashboard (Snowflake/Redshift), 'live' = Live connection (no data import), 'N/A' = unknown. Use this for data model type distribution analysis.",
      },
      {
        name: 'CUBE_NAME',
        dataType: 'text',
        expression: '[DIM_CUBES.CUBE_NAME]',
        description: 'Data model name',
      },
      {
        name: 'DATE_CUBE_CREATED',
        dataType: 'datetime',
        expression: '[DIM_CUBES.DATE_CUBE_CREATED (Calendar)]',
        description: 'Date cube was first created.',
      },
      {
        name: 'DATE_CUBE_LAST_ACTIVITY',
        dataType: 'datetime',
        expression: '[DIM_CUBES.DATE_CUBE_LAST_ACTIVITY (Calendar)]',
        description: 'Most recent activity date (queried, built, or reported).',
      },
      {
        name: 'DATE_LAST_BUILT',
        dataType: 'datetime',
        expression: '[DIM_CUBES.DATE_LAST_BUILT (Calendar)]',
        description: 'Last date cube was built/refreshed.',
      },
      {
        name: 'DATE_LAST_QUERIED',
        dataType: 'datetime',
        expression: '[DIM_CUBES.DATE_LAST_QUERIED (Calendar)]',
        description: 'Last date cube was queried by users.',
      },
      {
        name: 'DATE_LAST_REPORTED',
        dataType: 'datetime',
        expression: '[DIM_CUBES.DATE_LAST_REPORTED (Calendar)]',
        description: 'Last date cube was reported in CubeSizeOnDisk message.',
      },
      {
        name: 'DEPLOYMENT_ID',
        dataType: 'text',
        expression: '[DIM_CUBES.DEPLOYMENT_ID]',
        description: 'Deployment GUID where data model exists',
      },
      {
        name: 'IS_CREATED_LAST_30D',
        dataType: 'text',
        expression: '[DIM_CUBES.IS_CREATED_LAST_30D]',
        description: 'TRUE = cube created within last 30 days.',
      },
      {
        name: 'IS_INACTIVE',
        dataType: 'text',
        expression: '[DIM_CUBES.IS_INACTIVE]',
        description:
          'TRUE = data model has no activity for 21+ days or was removed from CubeSizeOnDisk for 3+ days. Filter is_inactive = FALSE for active data models only.',
      },
      {
        name: 'LICENSE_ID',
        dataType: 'text',
        expression: '[DIM_CUBES.LICENSE_ID]',
        description: 'Unique identifier for licenses',
      },
      {
        name: 'UNIQUE_CUBE_COUNT_KEY',
        dataType: 'text',
        expression: '[DIM_CUBES.UNIQUE_CUBE_COUNT_KEY]',
        description:
          'Unique identifier, use for counting data models/cubes. Uses unique_cube_identifier if available, otherwise cube_identifier_by_cube_name. Always use this column for COUNT DISTINCT operations on cubes.',
      },
    ],
  },
  {
    name: 'DIM_DEPLOYMENT',
    columns: [
      {
        name: 'ACCOUNT_ID',
        dataType: 'text',
        expression: '[DIM_DEPLOYMENT.ACCOUNT_ID]',
        description: 'Unique identifier for accounts',
      },
      {
        name: 'DEPLOYMENT_ID',
        dataType: 'text',
        expression: '[DIM_DEPLOYMENT.DEPLOYMENT_ID]',
        description: "Deployment GUID. Primary deployment ID for Linux. 'N/A' for Windows.",
      },
      {
        name: 'FIRST_USAGE_DATE',
        dataType: 'datetime',
        expression: '[DIM_DEPLOYMENT.FIRST_USAGE_DATE (Calendar)]',
        description: 'First date this deployment was detected in usage data.',
      },
      {
        name: 'IS_ACTIVE_LAST_30D',
        dataType: 'text',
        expression: '[DIM_DEPLOYMENT.IS_ACTIVE_LAST_30D]',
        description: "'Yes' = activity in last 30 days; 'No' = inactive.",
      },
      {
        name: 'LAST_USAGE_DATE',
        dataType: 'datetime',
        expression: '[DIM_DEPLOYMENT.LAST_USAGE_DATE (Calendar)]',
        description: 'Most recent activity date for this deployment.',
      },
      {
        name: 'LICENSE_ID',
        dataType: 'text',
        expression: '[DIM_DEPLOYMENT.LICENSE_ID]',
        description: 'Unique identifier for licenses',
      },
      {
        name: 'MACHINE_ID',
        dataType: 'text',
        expression: '[DIM_DEPLOYMENT.MACHINE_ID]',
        description:
          'Machine identifier. Primary deployment ID for Windows. Default value for Linux.',
      },
      {
        name: 'UNIQUE_DEPLOYMENT_MACHINE_ID',
        dataType: 'text',
        expression: '[DIM_DEPLOYMENT.UNIQUE_DEPLOYMENT_MACHINE_ID]',
        description:
          'Unique deployment instance identifier. Use for COUNT DISTINCT on all deployments (historical + current).',
      },
    ],
  },
  {
    name: 'DIM_LICENSE',
    columns: [
      {
        name: 'ACCOUNT_ID',
        dataType: 'text',
        expression: '[DIM_LICENSE.ACCOUNT_ID]',
        description:
          'Identifier for customer accounts, used for linking account-related data across systems.',
      },
      {
        name: 'ACTIVE_LICENSE',
        dataType: 'text',
        expression: '[DIM_LICENSE.ACTIVE_LICENSE]',
        description:
          'Indicates whether the license is currently active, used for license management and compliance.',
      },
      {
        name: 'ADMINS',
        dataType: 'numeric',
        expression: '[DIM_LICENSE.ADMINS]',
        description: 'Represents the license limit for users assigned the Admin roles.',
      },
      {
        name: 'CORES_LIMIT',
        dataType: 'numeric',
        expression: '[DIM_LICENSE.CORES_LIMIT]',
        description:
          'Limit on the number of processing cores for licenses, used to manage computational resources and performance.',
      },
      {
        name: 'DATE_EXPIRED',
        dataType: 'datetime',
        expression: '[DIM_LICENSE.DATE_EXPIRED (Calendar)]',
        description:
          'Date when the license expires with daily granularity from 2010, used to manage license renewals and compliance.',
      },
      {
        name: 'DATE_UPDATED',
        dataType: 'datetime',
        expression: '[DIM_LICENSE.DATE_UPDATED (Calendar)]',
        description:
          'Timestamp of the last update made to the license record with second granularity from 2017, used for tracking changes and auditing.',
      },
      {
        name: 'DESIGNERS',
        dataType: 'numeric',
        expression: '[DIM_LICENSE.DESIGNERS]',
        description: 'Represents the license limit for users assigned the Designer roles.',
      },
      {
        name: 'DPA_SIGNED',
        dataType: 'text',
        expression: '[DIM_LICENSE.DPA_SIGNED]',
        description:
          'Indicates if the Data Processing Agreement is signed, used for compliance and legal purposes.',
      },
      {
        name: 'GB_LIMIT',
        dataType: 'numeric',
        expression: '[DIM_LICENSE.GB_LIMIT]',
        description:
          'Data storage limit in gigabytes for licenses, used to manage data usage and compliance.',
      },
      {
        name: 'HIGH_AVAILABILITY',
        dataType: 'text',
        expression: '[DIM_LICENSE.HIGH_AVAILABILITY]',
        description:
          'Indicates if high availability is enabled, used for service reliability assessments.',
      },
      {
        name: 'INFUSIONAPPS',
        dataType: 'text',
        expression: '[DIM_LICENSE.INFUSIONAPPS]',
        description:
          'Indicates if InfusionApps integration is enabled, used for feature management and integration checks.',
      },
      {
        name: 'INSTALLATION_TYPE',
        dataType: 'text',
        expression: '[DIM_LICENSE.INSTALLATION_TYPE]',
        description:
          "Type of installation for the license, used for operational categorization with illustrative values like 'Online' and 'Offline'.",
      },
      {
        name: 'IS_MULTI_TENANT',
        dataType: 'text',
        expression: '[DIM_LICENSE.IS_MULTI_TENANT]',
        description:
          'Indicates if the license supports multi-tenancy, used for deployment and architecture considerations.',
      },
      {
        name: 'LICENSE_ID',
        dataType: 'text',
        expression: '[DIM_LICENSE.LICENSE_ID]',
        description:
          'Unique identifier for licenses, facilitating tracking and management of licensing information.',
      },
      {
        name: 'LICENSE_NAME',
        dataType: 'text',
        expression: '[DIM_LICENSE.LICENSE_NAME]',
        description:
          "Name of the license, used for categorization and identification of different licensing agreements with illustrative values like 'Tessitura' and 'Assure Claims - Utica Dev'.",
      },
      {
        name: 'LICENSE_TYPE',
        dataType: 'text',
        expression: '[DIM_LICENSE.LICENSE_TYPE]',
        description:
          "Classification of the license type, used for filtering and reporting purposes with illustrative values like 'Trial' and 'Production'.",
      },
      {
        name: 'LONG_INDEX_EDITION',
        dataType: 'text',
        expression: '[DIM_LICENSE.LONG_INDEX_EDITION]',
        description:
          'Indicates if the long index edition feature is enabled, used for feature availability checks.',
      },
      {
        name: 'MONITORING_TOOL',
        dataType: 'text',
        expression: '[DIM_LICENSE.MONITORING_TOOL]',
        description:
          'Indicates if the monitoring tool feature is enabled, used for feature management.',
      },
      {
        name: 'NLG_PACKAGE__C',
        dataType: 'text',
        expression: '[DIM_LICENSE.NLG_PACKAGE__C]',
        description:
          'Indicates if the natural language generation package is included, used for feature availability checks.',
      },
      {
        name: 'NLP_PROVIDER',
        dataType: 'text',
        expression: '[DIM_LICENSE.NLP_PROVIDER]',
        description:
          'Provider of Natural Language Processing services associated with the license, used for service categorization.',
      },
      {
        name: 'NOTEBOOK_TAB',
        dataType: 'text',
        expression: '[DIM_LICENSE.NOTEBOOK_TAB]',
        description:
          'Indicates if the notebook tab feature is enabled, used for user interface customization.',
      },
      {
        name: 'PACKAGE_OWNER_FX',
        dataType: 'text',
        expression: '[DIM_LICENSE.PACKAGE_OWNER_FX]',
        description:
          "Email address of the package owner, used for communication and ownership identification with illustrative values like 'owner@company.example' and 'first.last@example.com'.",
      },
      {
        name: 'ROW_LIMIT',
        dataType: 'numeric',
        expression: '[DIM_LICENSE.ROW_LIMIT]',
        description:
          'Maximum number of rows allowed for licenses, used to enforce data constraints and manage performance.',
      },
      {
        name: 'SFDC_TRIAL_SLG',
        dataType: 'text',
        expression: '[DIM_LICENSE.SFDC_TRIAL_SLG]',
        description:
          'Salesforce-sourced text for trial SLG (sales-led growth) classification on the license, used to segment trial and conversion reporting.',
      },
      {
        name: 'UNLIMITED_STATIC_ACCESS',
        dataType: 'text',
        expression: '[DIM_LICENSE.UNLIMITED_STATIC_ACCESS]',
        description:
          'Indicates if unlimited static access is granted, used for access control and feature management.',
      },
      {
        name: 'USER_MACHINES',
        dataType: 'numeric',
        expression: '[DIM_LICENSE.USER_MACHINES]',
        description:
          'Count of user machines associated with licenses, used for resource allocation and management.',
      },
      {
        name: 'VIEWERS',
        dataType: 'numeric',
        expression: '[DIM_LICENSE.VIEWERS]',
        description: 'Represents the license limit for users assigned the Viewer role.',
      },
      {
        name: 'WEB_ACCESS_TOKEN',
        dataType: 'text',
        expression: '[DIM_LICENSE.WEB_ACCESS_TOKEN]',
        description:
          'Indicates if a web access token is available, used for authentication and access control.',
      },
      {
        name: 'WHITE_LABELING',
        dataType: 'text',
        expression: '[DIM_LICENSE.WHITE_LABELING]',
        description:
          'Indicates if white labeling is enabled, used for branding and customization purposes.',
      },
    ],
  },
  {
    name: 'FACT_CURRENT_DEPLOYMENTS_WITH_CLONES',
    columns: [
      {
        name: 'ASSOSIATED_URLS',
        dataType: 'text',
        expression: '[FACT_CURRENT_DEPLOYMENTS_WITH_CLONES.ASSOSIATED_URLS]',
        description:
          'Semicolon-separated list of cloud deployment URLs associated with this deployment. Multiple URLs indicate multiple cloud environments linked to the same license/version combination.',
      },
      {
        name: 'CURRENT_VERSION',
        dataType: 'text',
        expression: '[FACT_CURRENT_DEPLOYMENTS_WITH_CLONES.CURRENT_VERSION]',
        description:
          "Full version string (e.g., 'L2024.1.0.123'). The current version running on the deployment.",
      },
      {
        name: 'DEPLOYMENT_OS',
        dataType: 'text',
        expression: '[FACT_CURRENT_DEPLOYMENTS_WITH_CLONES.DEPLOYMENT_OS]',
        description: "Operating system: 'Linux' or 'Windows'.",
      },
      {
        name: 'IS_CLONED_DEPLOYMENT',
        dataType: 'text',
        expression: '[FACT_CURRENT_DEPLOYMENTS_WITH_CLONES.IS_CLONED_DEPLOYMENT]',
        description:
          'TRUE = deployment created by cloning, shares GUID with other deployments. FALSE = unique deployment.',
      },
      {
        name: 'LAST_USAGE_DATE',
        dataType: 'datetime',
        expression: '[FACT_CURRENT_DEPLOYMENTS_WITH_CLONES.LAST_USAGE_DATE (Calendar)]',
        description: 'Most recent activity date for this deployment.',
      },
      {
        name: 'MAJOR_VERSION',
        dataType: 'text',
        expression: '[FACT_CURRENT_DEPLOYMENTS_WITH_CLONES.MAJOR_VERSION]',
        description: "Major version (e.g., 'L2024.1', 'W8.2'). Use for grouping by release.",
      },
      {
        name: 'UNIQUE_DEPLOYMENT_MACHINE_ID',
        dataType: 'text',
        expression: '[FACT_CURRENT_DEPLOYMENTS_WITH_CLONES.UNIQUE_DEPLOYMENT_MACHINE_ID]',
        description:
          'Unique deployment instance identifier. Use for COUNT DISTINCT on deployment instances (only current/recent/active).',
      },
    ],
  },
];
