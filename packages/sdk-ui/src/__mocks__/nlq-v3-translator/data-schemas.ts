import { NormalizedTable } from '@/modules/analytics-composer/index-node.js';

export const SAMPLE_ECOMMERCE_DATA_SOURCE = {
  id: 'localhost_aSampleIAAaECommerce',
  title: 'Sample ECommerce',
  address: 'LocalHost',
  live: false,
};

export const SAMPLE_RETAIL_DATA_SOURCE = {
  id: 'localhost_aSampleIAAaRetail',
  title: 'Sample Retail',
  address: 'LocalHost',
  live: false,
};

export const SAMPLE_HEALTHCARE_DATA_SOURCE = {
  id: 'localhost_aSampleIAAaHealthcare',
  title: 'Sample Healthcare',
  address: 'LocalHost',
  live: false,
};

export const SAMPLE_LEAD_GENERATION_DATA_SOURCE = {
  id: 'localhost_aSampleIAAaLeadIAAaGeneration',
  title: 'Sample Lead Generation',
  address: 'LocalHost',
  live: false,
};

export const BENCHMARK_SNOWFLAKE_DATA_SOURCE = {
  id: 'live:Benchmark_test_snowflake',
  title: 'Benchmark_test_snowflake',
  address: 'LocalHost',
  live: true,
};

export const CERTIFIED_DATA_MODEL_FOR_AI_DATA_SOURCE = {
  id: 'live:certified_data_model_for_ai',
  title: 'certified_data_model_for_ai',
  address: '',
  live: true,
};

export const SAMPLE_ECOMMERCE_TABLES: NormalizedTable[] = [
  {
    name: 'Brand',
    columns: [
      {
        name: 'Brand',
        dataType: 'text',
        expression: '[Brand.Brand]',
        description: 'Brand.Brand',
      },
      {
        name: 'Brand ID',
        dataType: 'numeric',
        expression: '[Brand.Brand ID]',
        description: 'Brand.Brand ID',
      },
    ],
  },
  {
    name: 'Category',
    columns: [
      {
        name: 'Category',
        dataType: 'text',
        expression: '[Category.Category]',
        description: 'Category.Category',
      },
      {
        name: 'Category ID',
        dataType: 'numeric',
        expression: '[Category.Category ID]',
        description: 'Category.Category ID',
      },
    ],
  },
  {
    name: 'Commerce',
    columns: [
      {
        name: 'Age Range',
        dataType: 'text',
        expression: '[Commerce.Age Range]',
        description: 'Commerce.Age Range',
      },
      {
        name: 'Brand ID',
        dataType: 'numeric',
        expression: '[Commerce.Brand ID]',
        description: 'Commerce.Brand ID',
      },
      {
        name: 'Category ID',
        dataType: 'numeric',
        expression: '[Commerce.Category ID]',
        description: 'Commerce.Category ID',
      },
      {
        name: 'Condition',
        dataType: 'text',
        expression: '[Commerce.Condition]',
        description: 'Commerce.Condition',
      },
      {
        name: 'Cost',
        dataType: 'numeric',
        expression: '[Commerce.Cost]',
        description: 'Commerce.Cost',
      },
      {
        name: 'Country ID',
        dataType: 'numeric',
        expression: '[Commerce.Country ID]',
        description: 'Commerce.Country ID',
      },
      {
        name: 'Date',
        dataType: 'datetime',
        expression: '[Commerce.Date (Calendar)]',
        description: 'Commerce.Date',
      },
      {
        name: 'Gender',
        dataType: 'text',
        expression: '[Commerce.Gender]',
        description: 'Commerce.Gender',
      },
      {
        name: 'Quantity',
        dataType: 'numeric',
        expression: '[Commerce.Quantity]',
        description: 'Commerce.Quantity',
      },
      {
        name: 'Revenue',
        dataType: 'numeric',
        expression: '[Commerce.Revenue]',
        description: 'Commerce.Revenue',
      },
      {
        name: 'Visit ID',
        dataType: 'numeric',
        expression: '[Commerce.Visit ID]',
        description: 'Commerce.Visit ID',
      },
    ],
  },
  {
    name: 'Country',
    columns: [
      {
        name: 'Country',
        dataType: 'text',
        expression: '[Country.Country]',
        description: 'Country.Country',
      },
      {
        name: 'Country ID',
        dataType: 'numeric',
        expression: '[Country.Country ID]',
        description: 'Country.Country ID',
      },
    ],
  },
];

export const SAMPLE_RETAIL_TABLES: NormalizedTable[] = [
  {
    name: 'DimCountries',
    columns: [
      {
        name: 'CountryName',
        description: '',
        dataType: 'text',
        expression: '[DimCountries.CountryName]',
      },
      {
        name: 'Region',
        description: '',
        dataType: 'text',
        expression: '[DimCountries.Region]',
      },
    ],
  },
  {
    name: 'DimCustomers',
    columns: [
      {
        name: 'CustomerID',
        dataType: 'numeric',
        expression: '[DimCustomers.CustomerID]',
      },
      {
        name: 'StoreID',
        dataType: 'numeric',
        expression: '[DimCustomers.StoreID]',
      },
      {
        name: 'TerritoryID',
        dataType: 'numeric',
        expression: '[DimCustomers.TerritoryID]',
      },
    ],
  },
  {
    name: 'DimDate',
    columns: [
      {
        name: 'Date',
        dataType: 'datetime',
        expression: '[DimDate.Date (Calendar)]',
      },
    ],
  },
  {
    name: 'DimEmployees',
    columns: [
      {
        name: 'EmployeeName',
        dataType: 'text',
        expression: '[DimEmployees.EmployeeName]',
      },
      {
        name: 'TeamID',
        dataType: 'numeric',
        expression: '[DimEmployees.TeamID]',
      },
      {
        name: 'TeamManger',
        dataType: 'text',
        expression: '[DimEmployees.TeamManger]',
      },
    ],
  },
  {
    name: 'DimProducts',
    columns: [
      {
        name: 'CategoryID',
        dataType: 'numeric',
        expression: '[DimProducts.CategoryID]',
      },
      {
        name: 'CategoryName',
        dataType: 'text',
        expression: '[DimProducts.CategoryName]',
      },
      {
        name: 'Color',
        dataType: 'text',
        expression: '[DimProducts.Color]',
      },
      {
        name: 'Price',
        dataType: 'numeric',
        expression: '[DimProducts.Price]',
      },
      {
        name: 'ProductName',
        dataType: 'text',
        expression: '[DimProducts.ProductName]',
      },
    ],
  },
  {
    name: 'Fact_Purchase_Orders',
    columns: [
      {
        name: 'CountryName',
        dataType: 'text',
        expression: '[Fact_Purchase_Orders.CountryName]',
      },
      {
        name: 'PurchaseCost',
        dataType: 'numeric',
        expression: '[Fact_Purchase_Orders.PurchaseCost]',
      },
      {
        name: 'PurchaseDiscount',
        dataType: 'numeric',
        expression: '[Fact_Purchase_Orders.PurchaseDiscount]',
      },
      {
        name: 'PurchaseOrderID',
        dataType: 'numeric',
        expression: '[Fact_Purchase_Orders.PurchaseOrderID]',
      },
      {
        name: 'PurchasePrice',
        dataType: 'numeric',
        expression: '[Fact_Purchase_Orders.PurchasePrice]',
      },
      {
        name: 'Region',
        dataType: 'text',
        expression: '[Fact_Purchase_Orders.Region]',
      },
      {
        name: 'StockedQty',
        dataType: 'numeric',
        expression: '[Fact_Purchase_Orders.StockedQty]',
      },
      {
        name: 'TerritoryID',
        dataType: 'numeric',
        expression: '[Fact_Purchase_Orders.Territory ID]',
      },
      {
        name: 'VendorName',
        dataType: 'text',
        expression: '[Fact_Purchase_Orders.VendorName]',
      },
    ],
  },
  {
    name: 'Fact_Sale_orders',
    columns: [
      {
        name: 'Freight',
        dataType: 'numeric',
        expression: '[Fact_Sale_orders.Freight]',
      },
      {
        name: 'OnlineOrderFlag',
        dataType: 'text',
        expression: '[Fact_Sale_orders.OnlineOrderFlag]',
      },
      {
        name: 'OrderQty',
        dataType: 'numeric',
        expression: '[Fact_Sale_orders.OrderQty]',
      },
      {
        name: 'OrderRevenue',
        dataType: 'numeric',
        expression: '[Fact_Sale_orders.OrderRevenue]',
      },
      {
        name: 'Region',
        dataType: 'text',
        expression: '[Fact_Sale_orders.Region]',
      },
      {
        name: 'SalesOrderID',
        dataType: 'numeric',
        expression: '[Fact_Sale_orders.SalesOrderID]',
      },
      {
        name: 'UnitPrice',
        dataType: 'numeric',
        expression: '[Fact_Sale_orders.UnitPrice]',
      },
      {
        name: 'UnitPriceDiscount',
        dataType: 'numeric',
        expression: '[Fact_Sale_orders.UnitPriceDiscount]',
      },
    ],
  },
];

export const SAMPLE_HEALTHCARE_TABLES: NormalizedTable[] = [
  {
    name: 'Admissions',
    columns: [
      {
        name: 'Admission_Time',
        dataType: 'datetime',
        expression: '[Admissions.Admission_Time (Calendar)]',
      },
      {
        name: 'Cost_of_admission',
        dataType: 'numeric',
        expression: '[Admissions.Cost_of_admission]',
      },
      {
        name: 'Death',
        dataType: 'text',
        expression: '[Admissions.Death]',
      },
      {
        name: 'Diagnosis_ID',
        dataType: 'numeric',
        expression: '[Admissions.Diagnosis_ID]',
      },
      {
        name: 'Discharge_Time',
        dataType: 'datetime',
        expression: '[Admissions.Discharge_Time (Calendar)]',
      },
      {
        name: 'Doctor_ID',
        dataType: 'numeric',
        expression: '[Admissions.Doctor_ID]',
      },
      {
        name: 'HAI',
        dataType: 'text',
        expression: '[Admissions.HAI]',
      },
      {
        name: 'ID',
        dataType: 'numeric',
        expression: '[Admissions.ID]',
      },
      {
        name: 'Patient_ID',
        dataType: 'numeric',
        expression: '[Admissions.Patient_ID]',
      },
      {
        name: 'Room_ID',
        dataType: 'numeric',
        expression: '[Admissions.Room_ID]',
      },
      {
        name: 'SSI',
        dataType: 'text',
        expression: '[Admissions.SSI]',
      },
      {
        name: 'Surgical_Procedure',
        dataType: 'text',
        expression: '[Admissions.Surgical_Procedure]',
      },
      {
        name: 'TimeofStay',
        dataType: 'numeric',
        expression: '[Admissions.Time of Stay]',
      },
    ],
  },
  {
    name: 'Conditionstimeofstay',
    columns: [
      {
        name: 'Average_time_of_stay',
        dataType: 'numeric',
        expression: '[Conditions time of stay.Average_time_of_stay]',
      },
      {
        name: 'ID',
        dataType: 'numeric',
        expression: '[Conditions time of stay.ID]',
      },
      {
        name: 'Negative',
        dataType: 'numeric',
        expression: '[Conditions time of stay.Negative]',
      },
      {
        name: 'Positive',
        dataType: 'numeric',
        expression: '[Conditions time of stay.Positive]',
      },
    ],
  },
  {
    name: 'Diagnosis',
    columns: [
      {
        name: 'Description',
        dataType: 'text',
        expression: '[Diagnosis.Description]',
      },
      {
        name: 'ID',
        dataType: 'numeric',
        expression: '[Diagnosis.ID]',
      },
    ],
  },
  {
    name: 'Divisions',
    columns: [
      {
        name: 'Divison_name',
        dataType: 'text',
        expression: '[Divisions.Divison_name]',
      },
      {
        name: 'ID',
        dataType: 'numeric',
        expression: '[Divisions.ID]',
      },
    ],
  },
  {
    name: 'Doctors',
    columns: [
      {
        name: 'Division_ID',
        dataType: 'numeric',
        expression: '[Doctors.Division_ID]',
      },
      {
        name: 'FullName',
        dataType: 'text',
        expression: '[Doctors.Full Name]',
      },
      {
        name: 'ID',
        dataType: 'numeric',
        expression: '[Doctors.ID]',
      },
      {
        name: 'Name',
        dataType: 'text',
        expression: '[Doctors.Name]',
      },
      {
        name: 'Specialty',
        dataType: 'text',
        expression: '[Doctors.Specialty]',
      },
      {
        name: 'Surname',
        dataType: 'text',
        expression: '[Doctors.Surname]',
      },
    ],
  },
  {
    name: 'ER',
    columns: [
      {
        name: 'Attendance_time',
        dataType: 'datetime',
        expression: '[ER.Attendance_time (Calendar)]',
      },
      {
        name: 'Check_in_time',
        dataType: 'datetime',
        expression: '[ER.Check_in_time (Calendar)]',
      },
      {
        name: 'Date',
        dataType: 'datetime',
        expression: '[ER.Date (Calendar)]',
      },
      {
        name: 'Diagnosis_ID',
        dataType: 'numeric',
        expression: '[ER.Diagnosis_ID]',
      },
      {
        name: 'ID',
        dataType: 'numeric',
        expression: '[ER.ID]',
      },
      {
        name: 'Patient_ID',
        dataType: 'numeric',
        expression: '[ER.Patient_ID]',
      },
      {
        name: 'Waitingtime',
        dataType: 'numeric',
        expression: '[ER.Waiting time]',
      },
    ],
  },
  {
    name: 'Patients',
    columns: [
      {
        name: 'DOB',
        dataType: 'text',
        expression: '[Patients.DOB]',
      },
      {
        name: 'FullName',
        dataType: 'text',
        expression: '[Patients.Full Name]',
      },
      {
        name: 'Gender',
        dataType: 'text',
        expression: '[Patients.Gender]',
      },
      {
        name: 'ID',
        dataType: 'numeric',
        expression: '[Patients.ID]',
      },
      {
        name: 'Name',
        dataType: 'text',
        expression: '[Patients.Name]',
      },
      {
        name: 'Surname',
        dataType: 'text',
        expression: '[Patients.Surname]',
      },
    ],
  },
  {
    name: 'Rooms',
    columns: [
      {
        name: 'Bed_count',
        dataType: 'numeric',
        expression: '[Rooms.Bed_count]',
      },
      {
        name: 'Division_ID',
        dataType: 'numeric',
        expression: '[Rooms.Division_ID]',
      },
      {
        name: 'ID',
        dataType: 'numeric',
        expression: '[Rooms.ID]',
      },
      {
        name: 'Room_number',
        dataType: 'numeric',
        expression: '[Rooms.Room_number]',
      },
    ],
  },
];

export const SAMPLE_LEAD_GENERATION_TABLES: NormalizedTable[] = [
  {
    name: 'Lead Generation',
    columns: [
      {
        name: '# Conversion Rate',
        dataType: 'numeric',
        expression: '[Lead Generation.# Conversion Rate]',
      },
      {
        name: '# Converted',
        dataType: 'numeric',
        expression: '[Lead Generation.# Converted]',
      },
      {
        name: '# Visits',
        dataType: 'numeric',
        expression: '[Lead Generation.# Visits]',
      },
      {
        name: 'City',
        dataType: 'text',
        expression: '[Lead Generation.City]',
      },
      {
        name: 'Cost',
        dataType: 'numeric',
        expression: '[Lead Generation.Cost]',
      },
      {
        name: 'Country',
        dataType: 'text',
        expression: '[Lead Generation.Country]',
      },
      {
        name: 'Date',
        dataType: 'datetime',
        expression: '[Lead Generation.Date (Calendar)]',
      },
      {
        name: 'Flow Status',
        dataType: 'text',
        expression: '[Lead Generation.Flow Status]',
      },
      {
        name: 'Landing Page',
        dataType: 'text',
        expression: '[Lead Generation.Landing Page]',
      },
      {
        name: 'Marketing Qualified',
        dataType: 'text',
        expression: '[Lead Generation.Marketing Qualified]',
      },
      {
        name: 'Referral Page',
        dataType: 'text',
        expression: '[Lead Generation.Referral Page]',
      },
      {
        name: 'Source',
        dataType: 'text',
        expression: '[Lead Generation.Source]',
      },
    ],
  },
];

export const BENCHMARK_SNOWFLAKE_TABLES: NormalizedTable[] = [
  {
    name: 'customer',
    columns: [
      {
        name: 'C_ACCTBAL',
        dataType: 'numeric',
        expression: '[customer.C_ACCTBAL]',
        description: '',
      },
      {
        name: 'C_ADDRESS',
        dataType: 'text',
        expression: '[customer.C_ADDRESS]',
        description: '',
      },
      {
        name: 'C_COMMENT',
        dataType: 'text',
        expression: '[customer.C_COMMENT]',
        description: '',
      },
      {
        name: 'C_CUSTKEY',
        dataType: 'numeric',
        expression: '[customer.C_CUSTKEY]',
        description: '',
      },
      {
        name: 'C_MKTSEGMENT',
        dataType: 'text',
        expression: '[customer.C_MKTSEGMENT]',
        description: '',
      },
      {
        name: 'C_NAME',
        dataType: 'text',
        expression: '[customer.C_NAME]',
        description: '',
      },
      {
        name: 'C_NATIONKEY',
        dataType: 'numeric',
        expression: '[customer.C_NATIONKEY]',
        description: '',
      },
      {
        name: 'C_PHONE',
        dataType: 'text',
        expression: '[customer.C_PHONE]',
        description: '',
      },
    ],
  },
  {
    name: 'lineitem',
    columns: [
      {
        name: 'L_COMMENT',
        dataType: 'text',
        expression: '[lineitem.L_COMMENT]',
        description: '',
      },
      {
        name: 'L_COMMITDATE',
        dataType: 'datetime',
        expression: '[lineitem.L_COMMITDATE (Calendar)]',
        description: '',
      },
      {
        name: 'L_DISCOUNT',
        dataType: 'numeric',
        expression: '[lineitem.L_DISCOUNT]',
        description: '',
      },
      {
        name: 'L_EXTENDEDPRICE',
        dataType: 'numeric',
        expression: '[lineitem.L_EXTENDEDPRICE]',
        description: '',
      },
      {
        name: 'L_LINENUMBER',
        dataType: 'numeric',
        expression: '[lineitem.L_LINENUMBER]',
        description: '',
      },
      {
        name: 'L_LINESTATUS',
        dataType: 'text',
        expression: '[lineitem.L_LINESTATUS]',
        description: '',
      },
      {
        name: 'L_ORDERKEY',
        dataType: 'numeric',
        expression: '[lineitem.L_ORDERKEY]',
        description: '',
      },
      {
        name: 'L_PARTKEY',
        dataType: 'numeric',
        expression: '[lineitem.L_PARTKEY]',
        description: '',
      },
      {
        name: 'L_QUANTITY',
        dataType: 'numeric',
        expression: '[lineitem.L_QUANTITY]',
        description: '',
      },
      {
        name: 'L_RECEIPTDATE',
        dataType: 'datetime',
        expression: '[lineitem.L_RECEIPTDATE (Calendar)]',
        description: '',
      },
      {
        name: 'L_RETURNFLAG',
        dataType: 'text',
        expression: '[lineitem.L_RETURNFLAG]',
        description: '',
      },
      {
        name: 'L_SHIPDATE',
        dataType: 'date',
        expression: '[lineitem.L_SHIPDATE (Calendar)]',
        description: '',
      },
      {
        name: 'L_SHIPINSTRUCT',
        dataType: 'text',
        expression: '[lineitem.L_SHIPINSTRUCT]',
        description: '',
      },
      {
        name: 'L_SHIPMODE',
        dataType: 'text',
        expression: '[lineitem.L_SHIPMODE]',
        description: '',
      },
      {
        name: 'L_SUPPKEY',
        dataType: 'numeric',
        expression: '[lineitem.L_SUPPKEY]',
        description: '',
      },
      {
        name: 'L_TAX',
        dataType: 'numeric',
        expression: '[lineitem.L_TAX]',
        description: '',
      },
    ],
  },
  {
    name: 'nation',
    columns: [
      {
        name: 'N_COMMENT',
        dataType: 'text',
        expression: '[nation.N_COMMENT]',
        description: '',
      },
      {
        name: 'N_NAME',
        dataType: 'text',
        expression: '[nation.N_NAME]',
        description: '',
      },
      {
        name: 'N_NATIONKEY',
        dataType: 'numeric',
        expression: '[nation.N_NATIONKEY]',
        description: '',
      },
      {
        name: 'N_REGIONKEY',
        dataType: 'numeric',
        expression: '[nation.N_REGIONKEY]',
        description: '',
      },
    ],
  },
  {
    name: 'orders',
    columns: [
      {
        name: 'O_CLERK',
        dataType: 'text',
        expression: '[orders.O_CLERK]',
        description: '',
      },
      {
        name: 'O_COMMENT',
        dataType: 'text',
        expression: '[orders.O_COMMENT]',
        description: '',
      },
      {
        name: 'O_CUSTKEY',
        dataType: 'numeric',
        expression: '[orders.O_CUSTKEY]',
        description: '',
      },
      {
        name: 'O_ORDERDATE',
        dataType: 'datetime',
        expression: '[orders.O_ORDERDATE (Calendar)]',
        description: '',
      },
      {
        name: 'O_ORDERKEY',
        dataType: 'numeric',
        expression: '[orders.O_ORDERKEY]',
        description: '',
      },
      {
        name: 'O_ORDERPRIORITY',
        dataType: 'text',
        expression: '[orders.O_ORDERPRIORITY]',
        description: '',
      },
      {
        name: 'O_ORDERSTATUS',
        dataType: 'text',
        expression: '[orders.O_ORDERSTATUS]',
        description: '',
      },
      {
        name: 'O_SHIPPRIORITY',
        dataType: 'numeric',
        expression: '[orders.O_SHIPPRIORITY]',
        description: '',
      },
      {
        name: 'O_TOTALPRICE',
        dataType: 'numeric',
        expression: '[orders.O_TOTALPRICE]',
        description: '',
      },
    ],
  },
  {
    name: 'ORDERS4SC%',
    columns: [
      {
        name: 'column#ws',
        dataType: 'text',
        expression: '[ORDERS4SC%.column#ws]',
        description: '',
      },
      {
        name: 'cuctcolwospecch',
        dataType: 'text',
        expression: '[ORDERS4SC%.cuctcolwospecch]',
        description: '',
      },
      {
        name: 'O_CLERK&',
        dataType: 'text',
        expression: '[ORDERS4SC%.O_CLERK&]',
        description: '',
      },
      {
        name: 'O_COMMENT',
        dataType: 'text',
        expression: '[ORDERS4SC%.O_COMMENT]',
        description: '',
      },
      {
        name: 'O_CUSTKEY',
        dataType: 'numeric',
        expression: '[ORDERS4SC%.O_CUSTKEY]',
        description: '',
      },
      {
        name: 'O_ORDERDATE',
        dataType: 'datetime',
        expression: '[ORDERS4SC%.O_ORDERDATE (Calendar)]',
        description: '',
      },
      {
        name: 'O_ORDERKEY',
        dataType: 'numeric',
        expression: '[ORDERS4SC%.O_ORDERKEY]',
        description: '',
      },
      {
        name: 'O_ORDERPRIORITY',
        dataType: 'text',
        expression: '[ORDERS4SC%.O_ORDERPRIORITY]',
        description: '',
      },
      {
        name: 'O_ORDERSTATUS',
        dataType: 'text',
        expression: '[ORDERS4SC%.O_ORDERSTATUS]',
        description: '',
      },
      {
        name: 'O_SHIPPRIORITY',
        dataType: 'numeric',
        expression: '[ORDERS4SC%.O_SHIPPRIORITY]',
        description: '',
      },
      {
        name: 'O_TOTALPRICE',
        dataType: 'numeric',
        expression: '[ORDERS4SC%.O_TOTALPRICE]',
        description: '',
      },
    ],
  },
  {
    name: 'part',
    columns: [
      {
        name: 'P_BRAND',
        dataType: 'text',
        expression: '[part.P_BRAND]',
        description: '',
      },
      {
        name: 'P_COMMENT',
        dataType: 'text',
        expression: '[part.P_COMMENT]',
        description: '',
      },
      {
        name: 'P_CONTAINER',
        dataType: 'text',
        expression: '[part.P_CONTAINER]',
        description: '',
      },
      {
        name: 'P_MFGR',
        dataType: 'text',
        expression: '[part.P_MFGR]',
        description: '',
      },
      {
        name: 'P_NAME',
        dataType: 'text',
        expression: '[part.P_NAME]',
        description: '',
      },
      {
        name: 'P_PARTKEY',
        dataType: 'numeric',
        expression: '[part.P_PARTKEY]',
        description: '',
      },
      {
        name: 'P_RETAILPRICE',
        dataType: 'numeric',
        expression: '[part.P_RETAILPRICE]',
        description: '',
      },
      {
        name: 'P_SIZE',
        dataType: 'numeric',
        expression: '[part.P_SIZE]',
        description: '',
      },
      {
        name: 'P_TYPE',
        dataType: 'text',
        expression: '[part.P_TYPE]',
        description: '',
      },
    ],
  },
  {
    name: 'partsupp',
    columns: [
      {
        name: 'PS_AVAILQTY',
        dataType: 'numeric',
        expression: '[partsupp.PS_AVAILQTY]',
        description: '',
      },
      {
        name: 'PS_COMMENT',
        dataType: 'text',
        expression: '[partsupp.PS_COMMENT]',
        description: '',
      },
      {
        name: 'PS_PARTKEY',
        dataType: 'numeric',
        expression: '[partsupp.PS_PARTKEY]',
        description: '',
      },
      {
        name: 'PS_SUPPKEY',
        dataType: 'numeric',
        expression: '[partsupp.PS_SUPPKEY]',
        description: '',
      },
      {
        name: 'PS_SUPPLYCOST',
        dataType: 'numeric',
        expression: '[partsupp.PS_SUPPLYCOST]',
        description: '',
      },
    ],
  },
  {
    name: 'region',
    columns: [
      {
        name: 'R_COMMENT',
        dataType: 'text',
        expression: '[region.R_COMMENT]',
        description: '',
      },
      {
        name: 'R_NAME',
        dataType: 'text',
        expression: '[region.R_NAME]',
        description: '',
      },
      {
        name: 'R_REGIONKEY',
        dataType: 'numeric',
        expression: '[region.R_REGIONKEY]',
        description: '',
      },
    ],
  },
  {
    name: 'supplier',
    columns: [
      {
        name: 'S_ACCTBAL',
        dataType: 'numeric',
        expression: '[supplier.S_ACCTBAL]',
        description: '',
      },
      {
        name: 'S_ADDRESS',
        dataType: 'text',
        expression: '[supplier.S_ADDRESS]',
        description: '',
      },
      {
        name: 'S_COMMENT',
        dataType: 'text',
        expression: '[supplier.S_COMMENT]',
        description: '',
      },
      {
        name: 'S_NAME',
        dataType: 'text',
        expression: '[supplier.S_NAME]',
        description: '',
      },
      {
        name: 'S_NATIONKEY',
        dataType: 'numeric',
        expression: '[supplier.S_NATIONKEY]',
        description: '',
      },
      {
        name: 'S_PHONE',
        dataType: 'text',
        expression: '[supplier.S_PHONE]',
        description: '',
      },
      {
        name: 'S_SUPPKEY',
        dataType: 'numeric',
        expression: '[supplier.S_SUPPKEY]',
        description: '',
      },
    ],
  },
];

export { CERTIFIED_DATA_MODEL_FOR_AI_TABLES } from './certified-data-model-for-ai-tables.js';
