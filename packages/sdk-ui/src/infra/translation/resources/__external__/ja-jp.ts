/* eslint-disable sonarjs/no-duplicate-string -- Locale strings deliberately repeat across
   unrelated keys and across CLDR plural forms this language does not distinguish (Time
   Frame's `_few`/`_many` mirroring `_other`). Constants would fragment the translations. */
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
  notifications: {
    dismiss: '通知を閉じる',
    auth: {
      sessionExpiredTitle: 'セッションの期限切れ',
      sessionExpiredMessage:
        'セッションの有効期限が切れました。続行するには再度サインインしてください。',
      authenticationFailedTitle: '認証に失敗しました',
      authenticationFailedMessage:
        '指定された認証情報は Sisense インスタンスによって拒否されました。',
    },
    permission: {
      forbiddenTitle: 'アクセスが拒否されました',
      forbiddenMessage: 'このデータにアクセスする権限がありません。',
    },
    network: {
      unreachableTitle: '接続の問題',
      unreachableMessage: 'Sisense インスタンスに接続できませんでした。',
    },
    server: {
      errorTitle: 'サーバーエラー',
      errorMessage: 'Sisense インスタンスがエラーを返しました。後でもう一度お試しください。',
    },
    general: {
      requestFailedTitle: 'リクエストに失敗しました',
      requestFailedMessage: 'Sisense インスタンスへのリクエストが失敗しました。',
    },
  },
  errorBoxText: '$t(common:error): {{errorMessage}}',
  chartNoData: '結果がありません',
  filters: 'フィルター',
  cancel: 'キャンセル',
  includeAll: 'すべて含める',
  formatting: {
    number: {
      abbreviations: {
        thousand: '(千)',
        million: '(百万)',
        billion: '(十億)',
        trillion: '(兆)',
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
    last: '過去',
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
  filterWidget: {
    placeholders: {
      setFilter: 'フィルターを設定',
    },
    dateRange: {
      from: '開始',
      to: '終了',
      invertedFrom: '終了日より前の日付を入力してください',
      invertedTo: '開始日より後の日付を入力してください',
    },
    numberRange: {
      minimum: '最小',
      maximum: '最大',
      notSet: '未設定',
      clear: '{{field}}をクリア',
    },
    rank: {
      rankedBy: 'ランク付け基準: {{- field}}',
      rankedByLabel: 'ランク付け基準:',
      topBy: '上位{{valA}}の基準:',
      bottomBy: '下位{{valA}}の基準:',
      chooseRankedBy: 'ランク付けするフィールドを選択してください: フィルター設定 › ランク付け基準',
      direction: 'ランキングの方向',
      count: 'メンバー数',
    },
    selectedCount: '{{count}} 件選択',
    allExceptCount: '{{count}} 件を除くすべて',
    setupTitle: 'フィルターウィジェットを設定',
    setupSubtitle: 'ディメンションを設定し、フィルターの動作を構成します',
    emptySetup: 'フィルターを設定',
    conditionUnsupported: '条件はテキスト、数値、日付フィールドで利用できます',
    dateCondition: {
      onOrBefore: 'この日またはそれ以前',
      onOrAfter: 'この日またはそれ以降',
      includingCurrent: '現在を含む',
      includingCurrentLabel: '現在を含む',
      countMin: '1 以上の整数を入力してください',
      /**
       * Japanese is postpositional — the date comes before the operator (前/以前 etc.),
       *  the opposite of English word order; relative needs the attributive の.
       */
      summary: {
        current: '{{- operator}}{{- grain}}',
        relative: '{{- operator}}の{{- count}}{{- grain}}',
        // Front-loaded, like the date shape: 現在を含む過去の3日, not 過去の3日 現在を含む.
        relativeIncludingCurrent: '{{- includingCurrent}}{{- operator}}の{{- count}}{{- grain}}',
        date: '{{- date}}{{- operator}}',
      },
    },
    conditionNotRepresentable: 'この条件はここでは編集できません',
    controls: {
      findInList: 'リスト内を検索',
      enterValue: '値を入力...',
      noMatches: '一致する項目がありません',
      clearSelection: '選択をクリア',
      overflowCount: '+{{count}}',
      select: '選択',
      selectDateLevel: '日付レベルを選択',
      selectCondition: '条件を選択',
      selectConnector: 'AND/ORを選択',
      addCondition: '+ 条件を追加',
      fillOrRemoveCondition: '入力するか、条件を削除してください',
      rangeOrderError: '2つ目の値は1つ目より大きくする必要があります',
      betweenMin: '最小値',
      betweenMax: '最大値',
      increaseCount: '増やす',
      decreaseCount: '減らす',
      selectValues: '{{level}}を選択',
      clear: 'クリア',
    },
    timeFrame: {
      /** Accessible name for the row-list popover — read to a screen reader on open. */
      listboxLabel: '期間オプション',
      /**
       * Row labels. Two shapes carry a `{{count}}`, which i18next resolves to the
       * `_one` (singular) or `_other` (plural) key by CLDR plural rules. Locales
       * with more plural forms — Russian's `_few`/`_many`, Polish's `_many` — add
       * more suffixes in their own resources; English needs only the two.
       */
      labels: {
        /** Day-grain count=1: `Today` / `Yesterday` / `Tomorrow` — calendar words, not arithmetic. */
        today: '今日',
        yesterday: '昨日',
        tomorrow: '明日',
        /** `This X` — single period, no count in the label. Day has none (Today covers it). */
        this: {
          week: '今週',
          month: '今月',
          quarter: '今四半期',
          year: '今年',
        },
        /**
         * `Last X` / `Last N X` — count drops for the singular, plural interpolates it.
         * Day `_one` renders as `Yesterday` and never reaches this key.
         */
        last: {
          week_one: '先週',
          week_few: '過去 {{count}} 週間',
          week_many: '過去 {{count}} 週間',
          week_other: '過去 {{count}} 週間',
          month_one: '先月',
          month_few: '過去 {{count}} か月',
          month_many: '過去 {{count}} か月',
          month_other: '過去 {{count}} か月',
          quarter_one: '前四半期',
          quarter_few: '過去 {{count}} 四半期',
          quarter_many: '過去 {{count}} 四半期',
          quarter_other: '過去 {{count}} 四半期',
          year_one: '昨年',
          year_few: '過去 {{count}} 年',
          year_many: '過去 {{count}} 年',
          year_other: '過去 {{count}} 年',
          day_few: '過去 {{count}} 日間',
          day_many: '過去 {{count}} 日間',
          day_other: '過去 {{count}} 日間',
        },
        /** `Next X` / `Next N X`. Day `_one` renders as `Tomorrow`. */
        next: {
          week_one: '来週',
          week_few: '今後 {{count}} 週間',
          week_many: '今後 {{count}} 週間',
          week_other: '今後 {{count}} 週間',
          month_one: '来月',
          month_few: '今後 {{count}} か月',
          month_many: '今後 {{count}} か月',
          month_other: '今後 {{count}} か月',
          quarter_one: '次の四半期',
          quarter_few: '今後 {{count}} 四半期',
          quarter_many: '今後 {{count}} 四半期',
          quarter_other: '今後 {{count}} 四半期',
          year_one: '来年',
          year_few: '今後 {{count}} 年',
          year_many: '今後 {{count}} 年',
          year_other: '今後 {{count}} 年',
          day_few: '今後 {{count}} 日間',
          day_many: '今後 {{count}} 日間',
          day_other: '今後 {{count}} 日間',
        },
        /** Paired frames — include the current period. Day grain has no such pair. */
        thisAndLast: {
          week: '今週と先週',
          month: '今月と先月',
          quarter: '今四半期と前四半期',
          year: '今年と昨年',
        },
        thisAndNext: {
          week: '今週と来週',
          month: '今月と来月',
          quarter: '今四半期と次の四半期',
          year: '今年と来年',
        },
      },
    },
    calendar: {
      selectDates: '日付を選択',
      multipleDaysHint: '複数の日付を選択できます',
      formatError: '{{- format}} 形式で入力してください',
      nonexistent: 'この日付は存在しません',
      chooseDate: '日付の選択',
      chooseDates: '日付の選択',
      previousMonth: '前の月',
      nextMonth: '次の月',
      previousYear: '前の年',
      nextYear: '次の年',
      openCalendar: 'カレンダーを開く',
      clearDate: '日付をクリア',
    },
  },
  unsupportedFilterMessage: 'サポートされていないフィルター（データクエリに適用）',
  unsupportedFilter: 'サポートされていないフィルター{{filter}}',
  commonFilter: {
    clearSelectionButton: '選択範囲のクリア',
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
    breadcrumbsPrev: '前',
    breadcrumbsNext: '次へ',
    popover: {
      members: 'メンバー',
      table: 'テーブル',
      column: '列',
    },
  },
  widgetHeader: {
    addTitle: 'タイトルを追加',
    info: {
      details: 'ウィジェットの詳細',
      tooltip: 'クリックして詳細を表示',
    },
    chartTableToggle: {
      switchToTable: 'テーブルに切り替え',
      switchToChart: 'チャートに切り替え',
    },
    menu: {
      deleteWidget: 'ウィジェットの削除',
      duplicateWidget: 'ウィジェットの複製',
      renameWidget: 'ウィジェットの名前を変更',
      distributeEqualWidth: 'この行に均等に分配',
      download: 'ダウンロード',
      csvFile: 'CSV ファイル',
      excelFile: 'Excel ファイル',
      repeatRowsRecommended: '行を繰り返す（推奨）',
      mergeRows: '行を結合する',
    },
  },
  customWidgets: {
    registerPrompt:
      '不明なカスタムウィジェットタイプ: {{customWidgetType}}。このカスタムウィジェットを登録してください。',
  },
  narrativeWidget: {
    generate: 'ナレーションを生成',
    regenerate: '再生成',
    retry: '生成を再試行',
    disclaimer: 'コンテンツはAIによって提供されているため、エラーが発生する可能性があります。',
    updatedAt: '更新日時: {{timestamp}}',
    copy: 'クリップボードにコピー',
    copied: 'コピーしました',
    creditsUsed: 'AIクレジットの{{usagePercentage}}%が使用されました。',
    aiContextHint:
      'パフォーマンス向上のため、<br/><strong>AI コンテキスト</strong>を追加してください',
    noDataTitle: '利用可能なダッシュボードデータがありません',
    noDataDescription: 'ダッシュボードデータが利用可能になると、ナレーションを生成できます。',
    failedTitle: 'ナレーションを生成できません',
    failedDescription:
      'しばらくしてからもう一度お試しください。問題が解決しない場合は、管理者にお問い合わせください。',
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
      readMore: 'さらに表示',
      collapse: '折りたたむ',
      yes: 'はい',
      no: 'いいえ',
      seeMore: 'もっと見る',
      generateNarrative: 'AIナレーションを生成',
      hideNarrative: 'AIナレーションを非表示',
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
      failedToFetchCreditBalance: 'クレジット残高の取得に失敗しました',
    },
    quota: {
      exceededErrorTitle: 'AIの応答は現在利用できません。',
      exceededErrorDescription:
        '会社の月次AIクォータに達しました。クォータは次の月次使用サイクルで自動的に更新されます。',
      warningDescription: '会社の月次AIクォータの{{usagePercentage}}%を使用しました。',
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
    tooltips: {
      selectAllPartiallyLoaded:
        'すべての値が表示されていません。リストを下にスクロールして残りの値を読み込んでください。下の「ではない」条件を使用して特定の値を除外することもできます。',
    },
    labels: {
      includeAll: 'すべて含める（フィルター適用なし）',
      allowMultiSelection: 'リストの複数選択を許可',
      from: '開始',
      to: '終了',
      includeCurrent: '現在を含む',
      rankedBy: 'ランク付け基準',
      selectField: 'フィールドを選択',
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
      between: '範囲',
      top: '上位',
      bottom: '下位',
    },
    validationErrors: {
      invalidNumber: '数字のみ',
      invalidNumericRange: '"終了"は"開始"より大きい必要があります',
    },
    datetimeLevels: {
      /* Japanese has no grammatical number — CLDR only defines "other", but every locale's
       * dictionary must share the same key shape, so the other suffixes mirror it too. */
      year: '年',
      year_one: '年',
      year_few: '年',
      year_many: '年',
      year_other: '年',
      quarter: '四半期',
      quarter_one: '四半期',
      quarter_few: '四半期',
      quarter_many: '四半期',
      quarter_other: '四半期',
      month: '月',
      month_one: '月',
      month_few: '月',
      month_many: '月',
      month_other: '月',
      week: '週',
      week_one: '週',
      week_few: '週',
      week_many: '週',
      week_other: '週',
      day: '日',
      day_one: '日',
      day_few: '日',
      day_many: '日',
      day_other: '日',
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
    more: 'もっと...',
    filter: 'フィルター',
    addMeasure: 'メジャーを追加',
  },
  pivotTable: {
    grandTotal: '総計',
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
  filterTile: {
    menu: {
      lock: 'ロック',
      unlock: 'ロック解除',
      lockGroup: 'グループをロック',
      unlockGroup: 'グループをロック解除',
    },
    toggleSwitch: 'フィルターを有効/無効にする',
    linkedToWidget: {
      label: 'フィルターウィジェットにリンク済み',
      tooltip:
        'このフィルターはフィルターパネルから編集できません。ダッシュボードで直接値を変更してください。',
      infoAriaLabel: 'フィルターウィジェットへのリンクに関する情報',
    },
  },
  chart: {
    indicator: {
      label: 'インジケーターチャート',
    },
    visualization: {
      label: 'データの可視化',
    },
    pivotTable: {
      label: 'ピボットテーブル',
    },
    table: {
      label: 'データテーブル',
      totalRows: '合計: {{formattedCount}} 行',
      rowsRange: '{{start}}〜{{end}}行',
    },
    sankey: {
      alerts: {
        tooManyStages:
          'サンキー図のステージ数は{{stageCount}}です。{{softLimit}}を超えると図が読みにくくなることがよくあります。カテゴリ列を減らすか、フィルターを厳しくしてください。',
      },
    },
  },
  kpi: {
    comparison: {
      vsPriorYear: '前年比',
      vsPriorQuarter: '前四半期比',
      vsPriorMonth: '前月比',
      vsPriorWeek: '前週比',
      vsPriorDay: '前日比',
      vsPriorPeriod: '前期比',
      vsBaseline: '{{label}}比',
      withBaseline: '{{label}}（{{baseline}}）',
    },
    target: {
      ofGoal: '目標の{{percent}}（{{goalValue}}）',
      toGo: '残り{{value}}',
    },
    percentFormat: '{{sign}}{{value}}%',
  },
  loadingOverlay: {
    label: 'コンテンツを読み込み中',
  },
  queryDefinition: {
    showMorePills: 'あと{{count}}件を表示',
    showLess: '表示を減らす',
    connectorBy: '別',
    connectorWhere: '条件',
    tooltipType: 'タイプ',
    tooltipColumn: '列',
    tooltipFormula: '数式',
    filterPill: {
      customFilter: 'カスタムフィルター',
      empty: '空',
      notEmpty: '空ではない',
      not: '{{value}}以外',
      and: 'かつ',
      or: 'または',
      moreValues: '{{values}} 他{{count}}件',
      range: '{{from}}～{{to}}',
      fromToLatest: '{{from}}～最も遅い日付',
      earliestTo: '最も早い日付～{{to}}',
      dependentOn: '{{parents}}に依存',
      dependentFilter: '依存フィルター',
      text: {
        contains: '{{value}}を含む',
        startsWith: '{{value}}で始まる',
        endsWith: '{{value}}で終わる',
        doesntEqual: '{{value}}と等しくない',
        doesntStartWith: '{{value}}で始まらない',
        doesntContain: '{{value}}を含まない',
        doesntEndWith: '{{value}}で終わらない',
        like: '{{value}}に類似',
      },
      ranking: {
        top: '上位{{count}}',
        bottom: '下位{{count}}',
        by: '{{measure}}による{{rank}}',
      },
      relative: {
        last: '過去{{count}}{{unit}}',
        next: '今後{{count}}{{unit}}',
        lastTo: '{{date}}までの過去{{count}}{{unit}}',
        nextFrom: '{{date}}からの{{count}}{{unit}}',
        includingCurrent: '{{period}}（現在を含む）',
        withOffset: '{{period}}、オフセット{{offset}}',
        today: '今日',
        thisWeek: '今週',
        thisMonth: '今月',
        thisQuarter: '今四半期',
        thisYear: '今年',
      },
      units: {
        year_one: '年',
        year_few: '年',
        year_many: '年',
        year_other: '年',
        quarter_one: '四半期',
        quarter_few: '四半期',
        quarter_many: '四半期',
        quarter_other: '四半期',
        month_one: 'か月',
        month_few: 'か月',
        month_many: 'か月',
        month_other: 'か月',
        week_one: '週間',
        week_few: '週間',
        week_many: '週間',
        week_other: '週間',
        day_one: '日',
        day_few: '日',
        day_many: '日',
        day_other: '日',
        hour_one: '時間',
        hour_few: '時間',
        hour_many: '時間',
        hour_other: '時間',
        minute_one: '分',
        minute_few: '分',
        minute_many: '分',
        minute_other: '分',
      },
    },
  },
  measures: {
    countShort: '{{level}}の件数',
    countDistinct: '一意をカウント',
    count: 'すべてカウント',
    average: '平均',
    sum: '合計',
    min: '最小',
    max: '最大',
    stdev: '標準偏差',
    median: '中央値',
    variance: '分散',
  },
  measuresAgg: {
    countDistinct: 'ユニーク数',
    count: '件数',
    sum: '合計',
    average: '平均',
    min: '最小',
    max: '最大',
    median: '中央値',
    variance: '分散',
    stdev: '標準偏差',
  },
};

export default [
  {
    language: 'ja-JP',
    namespace: SDK_UI_NAMESPACE,
    resources: translation,
  },
];
