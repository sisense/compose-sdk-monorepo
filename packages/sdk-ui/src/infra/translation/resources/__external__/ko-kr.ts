import type { TranslationDictionary } from '../index';
import { PACKAGE_NAMESPACE as SDK_UI_NAMESPACE } from '../index';

/**
 * Translation dictionary for Korean language.
 */
const translation: TranslationDictionary = {
  errors: {
    noSisenseContext: 'Sisense 컨텍스트가 초기화되지 않았습니다',
    restApiNotReady: 'REST API가 초기화되지 않았습니다',
    componentRenderError: '구성 요소를 렌더링할 수 없습니다',
    sisenseContextNoAuthentication: '인증 방법이 지정되지 않았습니다',
    chartNoSisenseContext:
      '차트의 Sisense 컨텍스트를 찾을 수 없습니다. 수정하려면 구성 요소를 Sisense 컨텍스트 공급자로 래핑하거나 props를 통해 기존 데이터 세트를 제공하세요.',
    widgetByIdNoSisenseContext:
      '대시보드 위젯의 Sisense 컨텍스트를 찾을 수 없습니다. 수정하려면 구성 요소를 Sisense 컨텍스트 공급자로 래핑하세요.',
    widgetByIdInvalidIdentifier:
      '대시보드 {{dashboardOid}}에서 위젯 {{widgetOid}}를 검색하지 못했습니다. ' +
      '대시보드 위젯이 존재하고 액세스 가능한지 확인하세요.',
    dashboardWidgetsInvalidIdentifiers:
      '대시보드 {{dashboardOid}}에서 대시보드 위젯을 검색하지 못했습니다. ' +
      '대시보드가 존재하고 액세스 가능한지 확인하세요.',
    executeQueryNoSisenseContext:
      '쿼리 실행을 위한 Sisense 컨텍스트를 찾을 수 없습니다. 수정하려면 구성 요소를 Sisense 컨텍스트 공급자로 래핑하세요.',
    executeQueryNoDataSource: '쿼리를 실행할 dataSource가 제공되지 않았습니다',
    dataOptions: {
      noDimensionsAndMeasures:
        '차원이나 측정값을 찾을 수 없습니다. 데이터 옵션에는 최소한 하나의 차원 또는 측정값이 있어야 합니다.',
      attributeNotFound: '데이터에서 속성 "{{attributeName}}"을(를) 찾을 수 없습니다',
      measureNotFound: '데이터에서 측정값 "{{measureName}}"을(를) 찾을 수 없습니다',
      filterAttributeNotFound: '데이터에서 필터 속성 "{{attributeName}}"을(를) 찾을 수 없습니다',
      highlightAttributeNotFound:
        '데이터에서 강조 표시 속성 "{{attributeName}}"을(를) 찾을 수 없습니다',
    },
    optionsTranslation: {
      invalidStyleOptions: "'{{chartType}}' 차트의 스타일 옵션이 잘못되었습니다",
      invalidInternalDataOptions:
        "'{{chartType}}' 차트의 데이터 옵션이 올바르게 변환되지 않았습니다",
    },
    themeNotFound: '연결된 Sisense 환경에서 oid {{themeOid}}의 테마를 찾을 수 없습니다',
    paletteNotFound: "연결된 Sisense 환경에서 팔레트 '{{paletteName}}'을(를) 찾을 수 없습니다",
    chartTypeNotSupported: '차트 유형 {{chartType}}은(는) 지원되지 않습니다',
    chartInvalidProps: '차트 유형에 대한 차트 props가 잘못되었습니다: {{chartType}}',
    unsupportedWidgetType: '지원되지 않는 위젯 유형의 props를 추출할 수 없습니다 - {{widgetType}}',
    dashboardInvalidIdentifier:
      '대시보드 {{dashboardOid}}를 검색하지 못했습니다. 대시보드가 존재하고 현재 사용자가 액세스할 수 있는지 확인하세요.',
    sharedFormula: {
      identifierExpected:
        '공유 수식을 검색하지 못했습니다. oid 또는 name과 datasource를 모두 제공하세요. ' +
        '제공된 값: name={{name}}, dataSource={{dataSource}}, oid={{oid}}',
      failedToFetchByOid: 'oid {{oid}}로 공유 수식을 가져오지 못했습니다',
      failedToFetchByName:
        'name {{name}} 및 dataSource {{dataSource}}로 공유 수식을 가져오지 못했습니다',
    },
    widgetModel: {
      incompleteWidget:
        'WidgetModelTranslator: 불완전한 속성({{prop}})으로 인해 위젯을 DTO로 변환할 수 없습니다',
      unsupportedWidgetTypeDto:
        'WidgetModelTranslator: 유형 {{chartType}}의 위젯 저장은 지원되지 않습니다',
      pivotWidgetNotSupported:
        'WidgetModelTranslator: 피벗 위젯은 메서드 {{methodName}}에서 지원되지 않습니다',
      textWidgetNotSupported:
        'WidgetModelTranslator: 텍스트 위젯은 메서드 {{methodName}}에서 지원되지 않습니다',
      onlyTableWidgetSupported:
        'WidgetModelTranslator: 테이블 위젯만 메서드 {{methodName}}에서 지원됩니다',
      onlyPivotWidgetSupported:
        'WidgetModelTranslator: 피벗 위젯만 메서드 {{methodName}}에서 지원됩니다',
      onlyTextWidgetSupported:
        'WidgetModelTranslator: 텍스트 위젯만 메서드 {{methodName}}에서 지원됩니다',
      onlyCustomWidgetSupported:
        'WidgetModelTranslator: 사용자 지정 위젯만 메서드 {{methodName}}에서 지원됩니다',
      unsupportedWidgetType: '지원되지 않는 위젯 유형: {{widgetType}}',
      unsupportedFusionWidgetType: '지원되지 않는 Fusion 위젯 유형: {{widgetType}}',
    },
    unknownFilterInFilterRelations:
      '필터 관계에 제공된 필터에서 찾을 수 없는 필터 {{filterGuid}}가 포함되어 있습니다',
    invalidFilterType: '잘못된 필터 유형입니다. 예상: {{filterType}}',
    secondsDateTimeLevelIsNotSupported:
      "이 데이터 소스에서는 날짜/시간 수준 'seconds'가 지원되지 않습니다",
    missingMenuRoot: '초기화된 메뉴 루트가 없습니다',
    missingModalRoot: '초기화된 모달 루트가 없습니다',
    missingDataSource:
      "'dataSource' 값이 없습니다. 명시적으로 제공하거나 Sisense 컨텍스트 공급자에서 'defaultDataSource'를 지정해야 합니다.",
    incorrectOnDataReadyHandler: "'onDataReady' 핸들러는 유효한 데이터 개체를 반환해야 합니다",
    emptyModel: '빈 모델',
    missingMetadata: '메타데이터가 없습니다',
    missingModelTitle: '모델 제목이 없습니다',
    httpClientNotFound: 'HttpClient를 찾을 수 없습니다.',
    serverSettingsNotLoaded: '서버 설정을 로드하지 못했습니다',
    requiredColumnMissing: '필수 열이 없습니다. {{hint}}',
    unexpectedChartType: '예상치 못한 차트 유형: {{chartType}}',
    noRowNumColumn: '데이터에 row num 열이 없습니다: {{columnName}}',
    tickIntervalCalculationFailed:
      '눈금 간격을 계산할 수 없습니다. 날짜/시간 세분성을 지정해 보세요.',
    polarChartDesignOptionsExpected: '극좌표 차트에는 극좌표 차트용 디자인 옵션이 필요합니다',
    polarChartDesignOptionsNotExpected:
      '극좌표가 아닌 차트에는 극좌표 차트용 디자인 옵션이 필요하지 않습니다',
    indicatorInvalidRelativeSize: '표시기 차트의 상대 크기 옵션이 잘못되었습니다',
    unsupportedMapType: '지원되지 않는 맵 유형: {{mapType}}',
    mapLoadingFailed: '맵 로드에 실패했습니다',
    cascadingFilterOriginalNotFound:
      '계단식 필터 재조립 중 오류가 발생했습니다. 원래 계단식 필터를 찾을 수 없습니다',
    dashboardLoadFailed: '대시보드 로드에 실패했습니다. {{error}}',
    widgetLoadFailed: '위젯 로드에 실패했습니다. {{error}}',
    failedToAddWidget: '대시보드에 위젯을 추가하지 못했습니다',
    widgetEmptyResponse: 'oid {{widgetOid}}의 위젯에 대한 빈 응답',
    dateFilterIncorrectOperator: '잘못된 연산자: {{operator}}',
    synchronizedFilterInvalidProps:
      '`useSynchronizedFilter` 훅은 [non-null `filterFromProps`] 또는 [`createEmptyFilter` 함수] 중 하나 이상을 사용해야 합니다',
    unexpectedCacheValue: '예상치 못한 캐시 값',
    notAMembersFilter: '필터가 MembersFilter가 아닙니다',
    drilldownNoInitialDimension:
      '사용자 지정 구성 요소와 함께 드릴다운을 사용하려면 초기 차원을 지정해야 합니다',
    otherWidgetTypesNotSupported: '다른 위젯 유형은 아직 지원되지 않습니다',
    dataBrowser: {
      dimensionNotFound: 'id {{dimensionId}}의 차원을 찾을 수 없습니다',
      attributeNotFound: 'id {{attributeId}}의 속성을 찾을 수 없습니다',
    },
    addFilterPopover: {
      noDataSources:
        '사용 가능한 데이터 소스가 없습니다. 위젯에서 `dataSource`를 정의하거나 대시보드 수준에서 `defaultDataSource`를 정의해 보세요.',
    },
    tabberInvalidConfiguration: 'Tabber 위젯 구성이 잘못되었습니다',
  },
  errorBoxText: '$t(common:error): {{errorMessage}}',
  chartNoData: '결과 없음',
  filters: '필터',
  cancel: '취소',
  includeAll: '모두 포함',
  formatting: {
    number: {
      abbreviations: {
        thousand: 'K',
        million: 'M',
        billion: 'B',
        trillion: 'T',
      },
    },
  },
  criteriaFilter: {
    displayModePrefix: '모든 항목',
    equals: '{{val}}과(와) 같음',
    notEquals: '{{val}}과(와) 같지 않음',
    lessThan: '{{val}}보다 작음',
    lessThanOrEqual: '{{val}}보다 작거나 같음',
    greaterThan: '{{val}}보다 큼',
    greaterThanOrEqual: '{{val}}보다 크거나 같음',
    between: '{{valA}}과(와) {{valB}} 사이',
    notBetween: '{{valA}}과(와) {{valB}} 사이가 아님',
    top: '{{valB}} 기준 상위 {{valA}}',
    bottom: '{{valB}} 기준 하위 {{valA}}',
    is: '{{val}}입니다',
    isNot: '{{val}}이(가) 아닙니다',
    contains: '{{val}} 포함',
    notContains: `{{val}} 포함하지 않음`,
    startsWith: '{{val}}로 시작',
    notStartsWith: `{{val}}로 시작하지 않음`,
    endsWith: '{{val}}로 끝남',
    notEndsWith: `{{val}}로 끝나지 않음`,
    like: '{{val}}과(와) 유사',
    byMeasure: '측정값별',
    by: '별',
  },
  dateFilter: {
    last: '마지막',
    next: '다음',
    from: '시작',
    to: '종료',
    count: '개수',
    select: '선택',
    today: '오늘',
    days: '일',
    weeks: '주',
    months: '월',
    quarters: '분기',
    years: '년',
    earliestDate: '가장 이른 날짜',
    latestDate: '가장 늦은 날짜',
    todayOutOfRange: '오늘은 사용 가능한 날짜 범위를 벗어났습니다',
    dateRange: {
      fromTo: '{{from}}부터 {{to}}까지',
      from: '{{val}}부터',
      to: '{{val}}까지',
    },
  },
  boxplot: {
    tooltip: {
      whiskers: '수염',
      box: '상자',
      min: '최소',
      median: '중앙값',
      max: '최대',
    },
  },
  treemap: {
    tooltip: {
      ofTotal: '전체의',
      of: '의',
    },
  },
  advanced: {
    tooltip: {
      min: '하한',
      max: '상한',
      forecastValue: '예측값',
      forecast: '예측',
      trend: '추세',
      trendLocalValue: '로컬 값',
      confidenceInterval: '신뢰 구간',
      trendType: '유형',
      trendDataKey: '추세 데이터',
      trendData: {
        min: '최소',
        max: '최대',
        median: '중앙값',
        average: '평균',
      },
    },
  },
  arearange: {
    tooltip: {
      min: '최소',
      max: '최대',
    },
  },
  unsupportedFilterMessage: '지원되지 않는 필터(데이터 쿼리에 적용됨)',
  unsupportedFilter: '지원되지 않는 필터 {{filter}}',
  commonFilter: {
    clearSelectionButton: '선택 해제',
    selectMenuItem: '선택',
    unselectMenuItem: '선택 해제',
  },
  customFilterTileMessage: '사용자 지정 필터로 필터링됨',
  filterRelations: {
    and: 'AND',
    or: 'OR',
    andOrFormulaApplied: 'AND/OR 수식 적용됨',
  },
  drilldown: {
    drillMenuItem: '드릴',
    breadcrumbsAllSuffix: '모두',
    breadcrumbsPrev: '이전',
    breadcrumbsNext: '다음',
    popover: {
      members: '멤버',
      table: '테이블',
      column: '열',
    },
  },
  widgetHeader: {
    info: {
      details: '위젯 세부 정보',
      tooltip: '클릭하여 전체 세부 정보 보기',
    },
    menu: {
      deleteWidget: '위젯 삭제',
      distributeEqualWidth: '이 행에서 균등하게 배포',
    },
  },
  customWidgets: {
    registerPrompt:
      '알 수 없는 사용자 지정 위젯 유형: {{customWidgetType}}. 이 사용자 지정 위젯을 등록하세요.',
  },
  ai: {
    analyticsChatbot: '분석 챗봇',
    dataTopics: '데이터 주제',
    chatbotDescription:
      '분석 챗봇은 자연어를 사용하여 데이터와 상호 작용하는 데 도움이 되도록 설계되었습니다.',
    topicSelectPrompt: '탐색하려는 주제를 선택하세요:',
    preview: '미리 보기',
    clearHistoryPrompt: '이 채팅을 지우시겠습니까?',
    config: {
      inputPromptText: '질문을 하거나 "/"를 입력하여 아이디어 얻기',
      welcomeText:
        '분석 도우미에 오신 것을 환영합니다! 데이터를 탐색하고 인사이트를 얻는 데 도움을 드릴 수 있습니다.',
      suggestionsWelcomeText: '가질 수 있는 몇 가지 질문:',
    },
    buttons: {
      insights: '인사이트',
      correctResponse: '올바른 응답',
      incorrectResponse: '잘못된 응답',
      clearChat: '채팅 지우기',
      refresh: '새로 고침',
      readMore: '더 읽기',
      collapse: '접기',
      yes: '예',
      no: '아니오',
      seeMore: '더 보기',
    },
    disclaimer: {
      poweredByAi: '콘텐츠는 AI로 구동되므로 예상치 못한 결과와 오류가 발생할 수 있습니다.',
      rateRequest: '개선할 수 있도록 응답을 평가해 주세요!',
    },
    errors: {
      chatUnavailable: '채팅을 사용할 수 없습니다. 나중에 다시 시도하세요.',
      fetchHistory:
        '문제가 발생하여 채팅 스레드를 검색할 수 없습니다. 처음부터 다시 시작하겠습니다!',
      recommendationsNotAvailable:
        '권장 사항을 현재 사용할 수 없습니다. 몇 분 후에 다시 시도하세요.',
      insightsNotAvailable: '사용 가능한 인사이트가 없습니다.',
      VectorDBEmptyResponseError: 'AI 구성이 준비되지 않았습니다. 몇 분 기다린 후 다시 시도하세요.',
      LlmBadConfigurationError:
        'LLM 구성이 잘못되었습니다. 관리자에게 문의하여 LLM 공급자 구성을 업데이트하세요.',
      ChartTypeUnsupportedError: '요청한 차트 유형은 지원되지 않습니다.',
      BlockedByLlmContentFiltering:
        '이 질문은 콘텐츠 관리 정책에 의해 차단되었습니다. 다른 질문을 시도하세요.',
      LlmContextLengthExceedsLimitError:
        '메시지 길이 제한에 도달한 것 같습니다. 이 대화를 지우세요.',
      UserPromptExeedsLimitError:
        '프롬프트가 제한을 초과했습니다. 질문을 다시 작성하고 더 짧은 프롬프트를 사용하세요.',
      unexpectedChatResponse: '문제가 발생했습니다. 나중에 다시 시도하거나 다른 질문을 시도하세요.',
      unexpected: '문제가 발생했습니다. 나중에 다시 시도하세요.',
      unknownResponse: '알 수 없는 responseType을 받았습니다. 원시 응답=',
      invalidInput: '잘못된 입력',
      noAvailableDataTopics: '제공된 데이터 모델 또는 관점 중 사용 가능한 것이 없습니다',
    },
  },
  attribute: {
    datetimeName: {
      years: '{{columnName}}의 연도',
      quarters: '{{columnName}}의 분기',
      months: '{{columnName}}의 월',
      weeks: '{{columnName}}의 주',
      days: '{{columnName}}의 일',
      hours: '{{columnName}}의 시간',
      minutes: '{{columnName}}의 분',
    },
  },
  filterEditor: {
    buttons: {
      apply: '적용',
      cancel: '취소',
      selectAll: '모두 선택',
      clearAll: '모두 지우기',
    },
    labels: {
      includeAll: '모두 포함(필터 적용 안 함)',
      allowMultiSelection: '목록에 대해 다중 선택 허용',
      from: '시작',
      to: '종료',
      includeCurrent: '현재 포함',
    },
    placeholders: {
      selectFromList: '목록에서 선택',
      enterEntry: '항목 입력...',
      enterValue: '값 입력...',
      select: '선택',
    },
    conditions: {
      exclude: '아님',
      contains: '포함',
      notContain: '포함하지 않음',
      startsWith: '로 시작',
      notStartsWith: '로 시작하지 않음',
      endsWith: '로 끝남',
      notEndsWith: '로 끝나지 않음',
      equals: '같음',
      notEquals: '같지 않음',
      isEmpty: '비어 있음',
      isNotEmpty: '비어 있지 않음',
      lessThan: '보다 작음',
      lessThanOrEqual: '보다 작거나 같음',
      greaterThan: '보다 큼',
      greaterThanOrEqual: '보다 크거나 같음',
      isWithin: '내부에 있음',
    },
    validationErrors: {
      invalidNumber: '숫자만',
      invalidNumericRange: '"종료"는 "시작"보다 커야 합니다',
    },
    datetimeLevels: {
      year: '년',
      quarter: '분기',
      month: '월',
      week: '주',
      day: '일',
      aggrigatedHour: '시간(집계)',
      aggrigatedMinutesRoundTo15: '15분(집계)',
    },
    relativeTypes: {
      last: '마지막',
      this: '이번',
      next: '다음',
    },
    datetimePositions: {
      before: '이전',
      after: '이후',
    },
  },
  dataBrowser: {
    addFilter: '필터 추가',
    selectField: '필드 선택',
    configureFilter: '필터 구성',
    noResults: '결과 없음',
    searchPlaceholder: '검색',
  },
  pivotTable: {
    grandTotal: '합계',
    subTotal: '{{value}} 합계',
    limits: {
      baseNote:
        '합계는 대시보드 소유자가 설정한 경우 전체 데이터를 참조할 수 있습니다. 사용 가능한 경우 필터를 사용하여 표시할 행과 열을 줄일 수 있습니다.',
      rowsLimit: '피벗 테이블은 {{recordsCount}}개 레코드로 제한됩니다',
      columnsLimit: '피벗 테이블은 {{columnsCount}}개 열로 제한됩니다',
      columnsAndRowsLimit:
        '피벗 테이블은 {{recordsCount}}개 레코드와 {{columnsCount}}개 열로 제한됩니다',
    },
  },
  dashboard: {
    toolbar: {
      undo: '실행 취소',
      redo: '다시 실행',
      cancel: '취소',
      apply: '적용',
      editLayout: '레이아웃 편집',
      viewMode: '보기 모드로 전환',
      showFilters: '필터 표시',
      hideFilters: '필터 숨기기',
      columns: '열',
      column: '열',
    },
  },
  jumpToDashboard: {
    defaultCaption: '이동',
    jumpableTooltip: '이 위젯은 이동 가능합니다',
  },
  calendarHeatmap: {
    navigation: {
      firstMonth: '첫 번째 월',
      lastMonth: '마지막 월',
      previousMonth: '이전 월',
      nextMonth: '다음 월',
      previousGroup: '이전 그룹',
      nextGroup: '다음 그룹',
    },
  },
};

export default [
  {
    language: 'ko-KR',
    namespace: SDK_UI_NAMESPACE,
    resources: translation,
  },
];
