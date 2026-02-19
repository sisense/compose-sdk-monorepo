import type { TranslationDictionary } from '../index';
import { PACKAGE_NAMESPACE as SDK_UI_NAMESPACE } from '../index';

/**
 * Translation dictionary for Japanese language.
 */
const translation: TranslationDictionary = {
  errors: {
    noSisenseContext: 'Sisenseコンテキストが初期化されていません',
    restApiNotReady: 'REST APIが初期化されていません',
    componentRenderError: 'コンポーネントをレンダリングできません',
    sisenseContextNoAuthentication: '認証方法が指定されていません',
    chartNoSisenseContext:
      'グラフのSisenseコンテキストが見つかりません。修正するには、コンポーネントをSisenseコンテキストプロバイダーでラップするか、props経由で既存のデータセットを提供してください。',
    widgetByIdNoSisenseContext:
      'ダッシュボードウィジェットのSisenseコンテキストが見つかりません。修正するには、コンポーネントをSisenseコンテキストプロバイダーでラップしてください。',
    widgetByIdInvalidIdentifier:
      'ダッシュボード{{dashboardOid}}からウィジェット{{widgetOid}}を取得できませんでした。 ' +
      'ダッシュボードウィジェットが存在し、アクセス可能であることを確認してください。',
    dashboardWidgetsInvalidIdentifiers:
      'ダッシュボード{{dashboardOid}}からダッシュボードウィジェットを取得できませんでした。 ' +
      'ダッシュボードが存在し、アクセス可能であることを確認してください。',
    executeQueryNoSisenseContext:
      'クエリ実行のSisenseコンテキストが見つかりません。修正するには、コンポーネントをSisenseコンテキストプロバイダーでラップしてください。',
    executeQueryNoDataSource: 'クエリを実行するためのdataSourceが提供されていません',
    dataOptions: {
      noDimensionsAndMeasures:
        'ディメンションもメジャーも見つかりませんでした。データオプションには少なくとも1つのディメンションまたはメジャーが必要です。',
      attributeNotFound: 'データに属性"{{attributeName}}"が見つかりません',
      measureNotFound: 'データにメジャー"{{measureName}}"が見つかりません',
      filterAttributeNotFound: 'データにフィルター属性"{{attributeName}}"が見つかりません',
      highlightAttributeNotFound: 'データにハイライト属性"{{attributeName}}"が見つかりません',
    },
    optionsTranslation: {
      invalidStyleOptions: "'{{chartType}}'グラフのスタイルオプションが無効です",
      invalidInternalDataOptions:
        "'{{chartType}}'グラフのデータオプションが正しく変換されていません",
    },
    themeNotFound: '接続されたSisense環境にoid {{themeOid}}のテーマが見つかりません',
    paletteNotFound: "接続されたSisense環境にパレット'{{paletteName}}'が見つかりません",
    chartTypeNotSupported: 'グラフタイプ{{chartType}}はサポートされていません',
    chartInvalidProps: 'グラフタイプのグラフプロップが無効です: {{chartType}}',
    unsupportedWidgetType:
      'サポートされていないウィジェットタイプのプロップを抽出できません - {{widgetType}}',
    dashboardInvalidIdentifier:
      'ダッシュボード{{dashboardOid}}を取得できませんでした。ダッシュボードが存在し、現在のユーザーがアクセス可能であることを確認してください。',
    sharedFormula: {
      identifierExpected:
        '共有フォーミュラを取得できませんでした。oidまたはnameとdatasourceの両方を提供してください。 ' +
        '提供された値: name={{name}}, dataSource={{dataSource}}, oid={{oid}}',
      failedToFetchByOid: 'oid {{oid}}で共有フォーミュラを取得できませんでした',
      failedToFetchByName:
        'name {{name}}とdataSource {{dataSource}}で共有フォーミュラを取得できませんでした',
    },
    widgetModel: {
      incompleteWidget:
        'WidgetModelTranslator: 不完全なプロパティ({{prop}})のため、ウィジェットをDTOに変換できません',
      unsupportedWidgetTypeDto:
        'WidgetModelTranslator: タイプ{{chartType}}のウィジェットの保存はサポートされていません',
      pivotWidgetNotSupported:
        'WidgetModelTranslator: ピボットウィジェットはメソッド{{methodName}}ではサポートされていません',
      textWidgetNotSupported:
        'WidgetModelTranslator: テキストウィジェットはメソッド{{methodName}}ではサポートされていません',
      onlyTableWidgetSupported:
        'WidgetModelTranslator: テーブルウィジェットのみがメソッド{{methodName}}でサポートされています',
      onlyPivotWidgetSupported:
        'WidgetModelTranslator: ピボットウィジェットのみがメソッド{{methodName}}でサポートされています',
      onlyTextWidgetSupported:
        'WidgetModelTranslator: テキストウィジェットのみがメソッド{{methodName}}でサポートされています',
      onlyCustomWidgetSupported:
        'WidgetModelTranslator: カスタムウィジェットのみがメソッド{{methodName}}でサポートされています',
      unsupportedWidgetType: 'サポートされていないウィジェットタイプ: {{widgetType}}',
      unsupportedFusionWidgetType: 'サポートされていないFusionウィジェットタイプ: {{widgetType}}',
    },
    unknownFilterInFilterRelations:
      'フィルター関係に、提供されたフィルターで見つからなかったフィルター{{filterGuid}}が含まれています',
    invalidFilterType: '無効なフィルタータイプ。期待値: {{filterType}}',
    secondsDateTimeLevelIsNotSupported:
      "このデータソースでは、日時レベル'seconds'はサポートされていません",
    missingMenuRoot: '初期化されたメニュールートが見つかりません',
    missingModalRoot: '初期化されたモーダルルートが見つかりません',
    missingDataSource:
      "'dataSource'の値が見つかりません。明示的に提供するか、Sisenseコンテキストプロバイダーで'defaultDataSource'を指定する必要があります。",
    incorrectOnDataReadyHandler:
      "'onDataReady'ハンドラーは有効なデータオブジェクトを返す必要があります",
    emptyModel: '空のモデル',
    missingMetadata: 'メタデータが見つかりません',
    missingModelTitle: 'モデルタイトルが見つかりません',
    httpClientNotFound: 'HttpClientが見つかりません。',
    serverSettingsNotLoaded: 'サーバー設定の読み込みに失敗しました',
    requiredColumnMissing: '必要な列が見つかりません。{{hint}}',
    unexpectedChartType: '予期しないグラフタイプ: {{chartType}}',
    noRowNumColumn: 'データにrow num列がありません: {{columnName}}',
    tickIntervalCalculationFailed: 'ティック間隔を計算できません。日時粒度を指定してみてください。',
    polarChartDesignOptionsExpected: '極座標グラフには極座標グラフ用のデザインオプションが必要です',
    polarChartDesignOptionsNotExpected:
      '極座標以外のグラフには極座標グラフ用デザインオプションは不要です',
    indicatorInvalidRelativeSize: 'インジケーターグラフの相対サイズオプションが無効です',
    unsupportedMapType: 'サポートされていないマップタイプ: {{mapType}}',
    mapLoadingFailed: 'マップの読み込みに失敗しました',
    cascadingFilterOriginalNotFound:
      'カスケードフィルターの再組み立てでエラーが発生しました。元のカスケードフィルターが見つかりません',
    dashboardLoadFailed: 'ダッシュボードの読み込みに失敗しました。{{error}}',
    widgetLoadFailed: 'ウィジェットの読み込みに失敗しました。{{error}}',
    failedToAddWidget: 'ダッシュボードにウィジェットを追加できませんでした',
    widgetEmptyResponse: 'oid {{widgetOid}}のウィジェットに対する空の応答',
    dateFilterIncorrectOperator: '不正な演算子: {{operator}}',
    synchronizedFilterInvalidProps:
      '`useSynchronizedFilter`フックは、[non-null `filterFromProps`]または[`createEmptyFilter`関数]の少なくとも1つを取る必要があります',
    unexpectedCacheValue: '予期しないキャッシュ値',
    notAMembersFilter: 'フィルターはMembersFilterではありません',
    drilldownNoInitialDimension:
      'カスタムコンポーネントでドリルダウンを使用するには、初期ディメンションを指定する必要があります',
    otherWidgetTypesNotSupported: 'その他のウィジェットタイプはまだサポートされていません',
    dataBrowser: {
      dimensionNotFound: 'id {{dimensionId}}のディメンションが見つかりません',
      attributeNotFound: 'id {{attributeId}}の属性が見つかりません',
    },
    addFilterPopover: {
      noDataSources:
        'データソースが利用できません。ウィジェットで`dataSource`を定義するか、ダッシュボードレベルで`defaultDataSource`を定義してみてください。',
    },
    tabberInvalidConfiguration: 'Tabberウィジェットの設定が無効です',
  },
  errorBoxText: '$t(common:error): {{errorMessage}}',
  chartNoData: '結果なし',
  filters: 'フィルター',
  cancel: 'キャンセル',
  includeAll: 'すべて含める',
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
    displayModePrefix: 'すべての項目',
    equals: '{{val}}に等しい',
    notEquals: '{{val}}に等しくない',
    lessThan: '{{val}}より小さい',
    lessThanOrEqual: '{{val}}以下',
    greaterThan: '{{val}}より大きい',
    greaterThanOrEqual: '{{val}}以上',
    between: '{{valA}}と{{valB}}の間',
    notBetween: '{{valA}}と{{valB}}の間ではない',
    top: '{{valB}}による上位{{valA}}',
    bottom: '{{valB}}による下位{{valA}}',
    is: '{{val}}です',
    isNot: '{{val}}ではありません',
    contains: '{{val}}を含む',
    notContains: `{{val}}を含まない`,
    startsWith: '{{val}}で始まる',
    notStartsWith: `{{val}}で始まらない`,
    endsWith: '{{val}}で終わる',
    notEndsWith: `{{val}}で終わらない`,
    like: '{{val}}に似ている',
    byMeasure: 'メジャー別',
    by: 'による',
  },
  dateFilter: {
    last: '最後',
    next: '次',
    from: '開始',
    to: '終了',
    count: 'カウント',
    select: '選択',
    today: '今日',
    days: '日',
    weeks: '週',
    months: '月',
    quarters: '四半期',
    years: '年',
    earliestDate: '最も早い日付',
    latestDate: '最も遅い日付',
    todayOutOfRange: '今日は利用可能な日付範囲外です',
    dateRange: {
      fromTo: '{{from}}から{{to}}まで',
      from: '{{val}}から',
      to: '{{val}}まで',
    },
  },
  boxplot: {
    tooltip: {
      whiskers: 'ひげ',
      box: 'ボックス',
      min: '最小',
      median: '中央値',
      max: '最大',
    },
  },
  treemap: {
    tooltip: {
      ofTotal: '合計の',
      of: 'の',
    },
  },
  advanced: {
    tooltip: {
      min: '下限',
      max: '上限',
      forecastValue: '予測値',
      forecast: '予測',
      trend: 'トレンド',
      trendLocalValue: 'ローカル値',
      confidenceInterval: '信頼区間',
      trendType: 'タイプ',
      trendDataKey: 'トレンドデータ',
      trendData: {
        min: '最小',
        max: '最大',
        median: '中央値',
        average: '平均',
      },
    },
  },
  arearange: {
    tooltip: {
      min: '最小',
      max: '最大',
    },
  },
  unsupportedFilterMessage: 'サポートされていないフィルター（データクエリに適用）',
  unsupportedFilter: 'サポートされていないフィルター{{filter}}',
  commonFilter: {
    clearSelectionButton: '選択をクリア',
    selectMenuItem: '選択',
    unselectMenuItem: '選択解除',
  },
  customFilterTileMessage: 'カスタムフィルターでフィルタリング',
  filterRelations: {
    and: 'AND',
    or: 'OR',
    andOrFormulaApplied: 'AND/OR式が適用されました',
  },
  drilldown: {
    drillMenuItem: 'ドリル',
    breadcrumbsAllSuffix: 'すべて',
    breadcrumbsPrev: '前へ',
    breadcrumbsNext: '次へ',
    popover: {
      members: 'メンバー',
      table: 'テーブル',
      column: '列',
    },
  },
  widgetHeader: {
    info: {
      details: 'ウィジェットの詳細',
      tooltip: 'クリックして詳細を表示',
    },
    menu: {
      deleteWidget: 'ウィジェットを削除',
      distributeEqualWidth: 'この行で均等に配分',
    },
  },
  customWidgets: {
    registerPrompt:
      '不明なカスタムウィジェットタイプ: {{customWidgetType}}。このカスタムウィジェットを登録してください。',
  },
  ai: {
    analyticsChatbot: '分析チャットボット',
    dataTopics: 'データトピック',
    chatbotDescription:
      '分析チャットボットは、自然言語を使用してデータと対話するのに役立つように設計されています。',
    topicSelectPrompt: '探索したいトピックを選択してください:',
    preview: 'プレビュー',
    clearHistoryPrompt: 'このチャットをクリアしますか？',
    config: {
      inputPromptText: '質問をするか、"/"を入力してアイデアを得る',
      welcomeText: '分析アシスタントへようこそ！データを探索し、洞察を得るお手伝いをします。',
      suggestionsWelcomeText: 'よくある質問:',
    },
    buttons: {
      insights: '洞察',
      correctResponse: '正しい応答',
      incorrectResponse: '間違った応答',
      clearChat: 'チャットをクリア',
      refresh: '更新',
      readMore: '続きを読む',
      collapse: '折りたたむ',
      yes: 'はい',
      no: 'いいえ',
      seeMore: 'もっと見る',
    },
    disclaimer: {
      poweredByAi:
        'コンテンツはAIによって提供されているため、予期しない結果やエラーが発生する可能性があります。',
      rateRequest: '改善のため、応答を評価してください！',
    },
    errors: {
      chatUnavailable: 'チャットは利用できません。後でもう一度お試しください。',
      fetchHistory:
        '問題が発生し、チャットスレッドを取得できませんでした。最初からやり直しましょう！',
      recommendationsNotAvailable: '推奨事項は現在利用できません。数分後にもう一度お試しください。',
      insightsNotAvailable: '利用可能な洞察がありません。',
      VectorDBEmptyResponseError:
        'AI設定の準備ができていません。数分待ってからもう一度お試しください。',
      LlmBadConfigurationError:
        'LLM設定が間違っています。管理者に連絡してLLMプロバイダー設定を更新してください。',
      ChartTypeUnsupportedError: '要求されたグラフタイプはサポートされていません。',
      BlockedByLlmContentFiltering:
        'この質問はコンテンツ管理ポリシーによってブロックされています。別の質問をお試しください。',
      LlmContextLengthExceedsLimitError:
        'メッセージの長さ制限に達したようです。この会話をクリアしてください。',
      UserPromptExeedsLimitError:
        'プロンプトが制限を超えています。質問を言い換えて、より短いプロンプトを使用してください。',
      unexpectedChatResponse:
        '申し訳ございません。問題が発生しました。後でもう一度お試しください。または、別の質問をお試しください。',
      unexpected: '申し訳ございません。問題が発生しました。後でもう一度お試しください。',
      unknownResponse: '不明なresponseTypeを受信しました。生の応答=',
      invalidInput: '無効な入力',
      noAvailableDataTopics: '提供されたデータモデルまたはパースペクティブのいずれも利用できません',
    },
  },
  attribute: {
    datetimeName: {
      years: '{{columnName}}の年',
      quarters: '{{columnName}}の四半期',
      months: '{{columnName}}の月',
      weeks: '{{columnName}}の週',
      days: '{{columnName}}の日',
      hours: '{{columnName}}の時間',
      minutes: '{{columnName}}の分',
    },
  },
  filterEditor: {
    buttons: {
      apply: '適用',
      cancel: 'キャンセル',
      selectAll: 'すべて選択',
      clearAll: 'すべてクリア',
    },
    labels: {
      includeAll: 'すべて含める（フィルター適用なし）',
      allowMultiSelection: 'リストの複数選択を許可',
      from: '開始',
      to: '終了',
      includeCurrent: '現在を含む',
    },
    placeholders: {
      selectFromList: 'リストから選択',
      enterEntry: 'エントリを入力...',
      enterValue: '値を入力...',
      select: '選択',
    },
    conditions: {
      exclude: 'ではない',
      contains: '含む',
      notContain: '含まない',
      startsWith: 'で始まる',
      notStartsWith: 'で始まらない',
      endsWith: 'で終わる',
      notEndsWith: 'で終わらない',
      equals: '等しい',
      notEquals: '等しくない',
      isEmpty: '空です',
      isNotEmpty: '空ではありません',
      lessThan: 'より小さい',
      lessThanOrEqual: '以下',
      greaterThan: 'より大きい',
      greaterThanOrEqual: '以上',
      isWithin: '以内',
    },
    validationErrors: {
      invalidNumber: '数字のみ',
      invalidNumericRange: '"終了"は"開始"より大きい必要があります',
    },
    datetimeLevels: {
      year: '年',
      quarter: '四半期',
      month: '月',
      week: '週',
      day: '日',
      aggrigatedHour: '時間（集計）',
      aggrigatedMinutesRoundTo15: '15分（集計）',
    },
    relativeTypes: {
      last: '最後',
      this: 'この',
      next: '次',
    },
    datetimePositions: {
      before: '前',
      after: '後',
    },
  },
  dataBrowser: {
    addFilter: 'フィルターを追加',
    selectField: 'フィールドを選択',
    configureFilter: 'フィルターを設定',
    noResults: '結果なし',
    searchPlaceholder: '検索',
  },
  pivotTable: {
    grandTotal: '合計',
    subTotal: '{{value}}合計',
    limits: {
      baseNote:
        '合計は、ダッシュボード所有者が設定した場合、完全なデータを参照する場合があります。利用可能な場合、フィルターを使用して表示する行と列を減らすことができます。',
      rowsLimit: 'ピボットテーブルは{{recordsCount}}レコードに制限されています',
      columnsLimit: 'ピボットテーブルは{{columnsCount}}列に制限されています',
      columnsAndRowsLimit:
        'ピボットテーブルは{{recordsCount}}レコードと{{columnsCount}}列に制限されています',
    },
  },
  dashboard: {
    toolbar: {
      undo: '元に戻す',
      redo: 'やり直す',
      cancel: 'キャンセル',
      apply: '適用',
      editLayout: 'レイアウトを編集',
      viewMode: '表示モードに切り替え',
      showFilters: 'フィルターを表示',
      hideFilters: 'フィルターを非表示',
      columns: '列',
      column: '列',
    },
  },
  jumpToDashboard: {
    defaultCaption: 'ジャンプ',
    jumpableTooltip: 'このウィジェットはジャンプ可能です',
  },
  calendarHeatmap: {
    navigation: {
      firstMonth: '最初の月',
      lastMonth: '最後の月',
      previousMonth: '前の月',
      nextMonth: '次の月',
      previousGroup: '前のグループ',
      nextGroup: '次のグループ',
    },
  },
};

export default [
  {
    language: 'ja-JP',
    namespace: SDK_UI_NAMESPACE,
    resources: translation,
  },
];
