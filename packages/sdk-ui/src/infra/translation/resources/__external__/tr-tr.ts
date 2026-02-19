import type { TranslationDictionary } from '../index';
import { PACKAGE_NAMESPACE as SDK_UI_NAMESPACE } from '../index';

/**
 * Translation dictionary for Turkish language.
 */
const translation: TranslationDictionary = {
  errors: {
    noSisenseContext: 'Sisense bağlamı başlatılmadı',
    restApiNotReady: 'REST API başlatılmadı',
    componentRenderError: 'Bileşen oluşturulamıyor',
    sisenseContextNoAuthentication: 'Kimlik doğrulama yöntemi belirtilmedi',
    chartNoSisenseContext:
      'Grafik için Sisense bağlamı bulunamadı. Düzeltmek için bileşeni bir Sisense bağlam sağlayıcısıyla sarın veya props aracılığıyla mevcut bir veri kümesi sağlayın.',
    widgetByIdNoSisenseContext:
      "Pano widget'ı için Sisense bağlamı bulunamadı. Düzeltmek için bileşeni bir Sisense bağlam sağlayıcısıyla sarın.",
    widgetByIdInvalidIdentifier:
      'Pano {{dashboardOid}} üzerinden widget {{widgetOid}} alınamadı. ' +
      "Pano widget'ının var olduğundan ve erişilebilir olduğundan emin olun.",
    dashboardWidgetsInvalidIdentifiers:
      "Pano {{dashboardOid}} üzerinden pano widget'ları alınamadı. " +
      'Panonun var olduğundan ve erişilebilir olduğundan emin olun.',
    executeQueryNoSisenseContext:
      'Sorgu yürütme için Sisense bağlamı bulunamadı. Düzeltmek için bileşeni bir Sisense bağlam sağlayıcısıyla sarın.',
    executeQueryNoDataSource: 'Sorguyu yürütmek için dataSource sağlanmadı',
    dataOptions: {
      noDimensionsAndMeasures:
        'Boyut veya ölçü bulunamadı. Veri seçenekleri en az bir boyut veya ölçü içermelidir.',
      attributeNotFound: 'Verilerde "{{attributeName}}" özniteliği bulunamadı',
      measureNotFound: 'Verilerde "{{measureName}}" ölçüsü bulunamadı',
      filterAttributeNotFound: 'Verilerde filtre özniteliği "{{attributeName}}" bulunamadı',
      highlightAttributeNotFound: 'Verilerde vurgulama özniteliği "{{attributeName}}" bulunamadı',
    },
    optionsTranslation: {
      invalidStyleOptions: "'{{chartType}}' grafiği için geçersiz stil seçenekleri",
      invalidInternalDataOptions:
        "'{{chartType}}' grafiği için veri seçenekleri doğru şekilde dönüştürülmedi",
    },
    themeNotFound: 'Bağlı Sisense ortamında oid {{themeOid}} teması bulunamadı',
    paletteNotFound: "Bağlı Sisense ortamında '{{paletteName}}' paleti bulunamadı",
    chartTypeNotSupported: 'Grafik türü {{chartType}} desteklenmiyor',
    chartInvalidProps: 'Grafik türü için geçersiz grafik props: {{chartType}}',
    unsupportedWidgetType: 'Desteklenmeyen widget türü için props çıkarılamıyor - {{widgetType}}',
    dashboardInvalidIdentifier:
      'Pano {{dashboardOid}} alınamadı. Panonun var olduğundan ve mevcut kullanıcı için erişilebilir olduğundan emin olun.',
    sharedFormula: {
      identifierExpected:
        'Paylaşılan formül alınamadı. Lütfen oid veya hem name hem de datasource sağlayın. ' +
        'Sağlanan değerler: name={{name}}, dataSource={{dataSource}}, oid={{oid}}',
      failedToFetchByOid: 'oid {{oid}} ile paylaşılan formül alınamadı',
      failedToFetchByName:
        'name {{name}} ve dataSource {{dataSource}} ile paylaşılan formül alınamadı',
    },
    widgetModel: {
      incompleteWidget:
        "WidgetModelTranslator: Widget, eksik özellik ({{prop}}) nedeniyle DTO'ya dönüştürülemiyor",
      unsupportedWidgetTypeDto:
        "WidgetModelTranslator: {{chartType}} türündeki widget'ın kaydedilmesi desteklenmiyor",
      pivotWidgetNotSupported:
        'WidgetModelTranslator: Pivot widget, {{methodName}} yöntemi için desteklenmiyor',
      textWidgetNotSupported:
        "WidgetModelTranslator: Metin widget'ı, {{methodName}} yöntemi için desteklenmiyor",
      onlyTableWidgetSupported:
        "WidgetModelTranslator: Yalnızca tablo widget'ı, {{methodName}} yöntemi için destekleniyor",
      onlyPivotWidgetSupported:
        'WidgetModelTranslator: Yalnızca pivot widget, {{methodName}} yöntemi için destekleniyor',
      onlyTextWidgetSupported:
        "WidgetModelTranslator: Yalnızca metin widget'ı, {{methodName}} yöntemi için destekleniyor",
      onlyCustomWidgetSupported:
        'WidgetModelTranslator: Yalnızca özel widget, {{methodName}} yöntemi için destekleniyor',
      unsupportedWidgetType: 'Desteklenmeyen widget türü: {{widgetType}}',
      unsupportedFusionWidgetType: 'Desteklenmeyen Fusion widget türü: {{widgetType}}',
    },
    unknownFilterInFilterRelations:
      'Filtre ilişkisi, sağlanan filtrelerde bulunamayan bir {{filterGuid}} filtresi içeriyor',
    invalidFilterType: 'Geçersiz filtre türü. Beklenen: {{filterType}}',
    secondsDateTimeLevelIsNotSupported:
      "Bu veri kaynağı için 'seconds' tarih/saat düzeyi desteklenmiyor",
    missingMenuRoot: 'Başlatılmış menü kökü eksik',
    missingModalRoot: 'Başlatılmış modal kökü eksik',
    missingDataSource:
      "'dataSource' değeri eksik. Açıkça sağlanmalı veya Sisense bağlam sağlayıcısında bir 'defaultDataSource' belirtilmelidir.",
    incorrectOnDataReadyHandler: "'onDataReady' işleyicisi geçerli bir veri nesnesi döndürmelidir",
    emptyModel: 'Boş model',
    missingMetadata: 'Meta veriler eksik',
    missingModelTitle: 'Model başlığı eksik',
    httpClientNotFound: 'HttpClient bulunamadı.',
    serverSettingsNotLoaded: 'Sunucu ayarları yüklenemedi',
    requiredColumnMissing: 'Gerekli bir sütun eksik. {{hint}}',
    unexpectedChartType: 'Beklenmeyen grafik türü: {{chartType}}',
    noRowNumColumn: 'Verilerde row num sütunu yok: {{columnName}}',
    tickIntervalCalculationFailed:
      'İşaret aralığı hesaplanamıyor. Tarih/saat ayrıntı düzeyini belirtmeyi deneyin.',
    polarChartDesignOptionsExpected:
      'Kutup grafiği için kutup grafiği tasarım seçenekleri bekleniyor',
    polarChartDesignOptionsNotExpected:
      'Kutup olmayan grafik için kutup grafiği tasarım seçenekleri beklenmiyor',
    indicatorInvalidRelativeSize: 'Gösterge grafiği için geçersiz göreli boyut seçenekleri',
    unsupportedMapType: 'Desteklenmeyen harita türü: {{mapType}}',
    mapLoadingFailed: 'Harita yüklenemedi',
    cascadingFilterOriginalNotFound:
      'Kademeli filtrelerin yeniden birleştirilmesinde hata. Orijinal kademeli filtre bulunamadı',
    dashboardLoadFailed: 'Pano yüklenemedi. {{error}}',
    widgetLoadFailed: 'Widget yüklenemedi. {{error}}',
    failedToAddWidget: 'Panele widget eklenemedi',
    widgetEmptyResponse: 'oid {{widgetOid}} ile widget için boş yanıt',
    dateFilterIncorrectOperator: 'Yanlış operatör: {{operator}}',
    synchronizedFilterInvalidProps:
      '`useSynchronizedFilter` kancası, [non-null `filterFromProps`] veya [`createEmptyFilter` işlevi] içinden en az birini kullanmalıdır',
    unexpectedCacheValue: 'Beklenmeyen önbellek değeri',
    notAMembersFilter: 'Filtre bir MembersFilter değil',
    drilldownNoInitialDimension:
      'Özel bileşenlerle detaylandırma kullanmak için başlangıç boyutu belirtilmelidir',
    otherWidgetTypesNotSupported: 'Diğer widget türleri henüz desteklenmiyor',
    dataBrowser: {
      dimensionNotFound: 'id {{dimensionId}} ile boyut bulunamadı',
      attributeNotFound: 'id {{attributeId}} ile öznitelik bulunamadı',
    },
    addFilterPopover: {
      noDataSources:
        "Kullanılabilir veri kaynağı yok. Widget'larda `dataSource` tanımlamayı veya pano düzeyinde `defaultDataSource` tanımlamayı deneyin.",
    },
    tabberInvalidConfiguration: 'Tabber widget yapılandırması geçersiz',
  },
  errorBoxText: '$t(common:error): {{errorMessage}}',
  chartNoData: 'Sonuç yok',
  filters: 'Filtreler',
  cancel: 'İptal',
  includeAll: 'Tümünü dahil et',
  formatting: {
    number: {
      abbreviations: {
        thousand: 'B',
        million: 'M',
        billion: 'B',
        trillion: 'T',
      },
    },
  },
  criteriaFilter: {
    displayModePrefix: 'Tüm öğeler',
    equals: '{{val}} eşittir',
    notEquals: '{{val}} eşit değildir',
    lessThan: '{{val}} den küçük',
    lessThanOrEqual: '{{val}} den küçük veya eşit',
    greaterThan: '{{val}} den büyük',
    greaterThanOrEqual: '{{val}} den büyük veya eşit',
    between: '{{valA}} ile {{valB}} arasında',
    notBetween: '{{valA}} ile {{valB}} arasında değil',
    top: '{{valB}} göre ilk {{valA}}',
    bottom: '{{valB}} göre son {{valA}}',
    is: '{{val}} dir',
    isNot: '{{val}} değildir',
    contains: '{{val}} içerir',
    notContains: `{{val}} içermez`,
    startsWith: '{{val}} ile başlar',
    notStartsWith: `{{val}} ile başlamaz`,
    endsWith: '{{val}} ile biter',
    notEndsWith: `{{val}} ile bitmez`,
    like: '{{val}} gibi',
    byMeasure: 'Ölçüme göre',
    by: 'göre',
  },
  dateFilter: {
    last: 'Son',
    next: 'Sonraki',
    from: 'Başlangıç',
    to: 'Bitiş',
    count: 'Sayı',
    select: 'Seç',
    today: 'Bugün',
    days: 'Günler',
    weeks: 'Haftalar',
    months: 'Aylar',
    quarters: 'Çeyrekler',
    years: 'Yıllar',
    earliestDate: 'En erken tarih',
    latestDate: 'En geç tarih',
    todayOutOfRange: 'Bugün kullanılabilir tarih aralığının dışında',
    dateRange: {
      fromTo: '{{from}} ile {{to}} arası',
      from: '{{val}} başlangıç',
      to: '{{val}} bitiş',
    },
  },
  boxplot: {
    tooltip: {
      whiskers: 'Bıyıklar',
      box: 'Kutu',
      min: 'Min',
      median: 'Medyan',
      max: 'Max',
    },
  },
  treemap: {
    tooltip: {
      ofTotal: 'toplamın',
      of: 'nin',
    },
  },
  advanced: {
    tooltip: {
      min: 'Alt sınır',
      max: 'Üst sınır',
      forecastValue: 'Tahmin değeri',
      forecast: 'Tahmin',
      trend: 'Eğilim',
      trendLocalValue: 'Yerel değer',
      confidenceInterval: 'Güven aralığı',
      trendType: 'Tür',
      trendDataKey: 'Eğilim verisi',
      trendData: {
        min: 'Min',
        max: 'Maks',
        median: 'Medyan',
        average: 'Ortalama',
      },
    },
  },
  arearange: {
    tooltip: {
      min: 'Min',
      max: 'Max',
    },
  },
  unsupportedFilterMessage: 'Desteklenmeyen filtre (veri sorgusuna uygulandı)',
  unsupportedFilter: 'Desteklenmeyen filtre {{filter}}',
  commonFilter: {
    clearSelectionButton: 'Seçimi temizle',
    selectMenuItem: 'Seç',
    unselectMenuItem: 'Seçimi kaldır',
  },
  customFilterTileMessage: 'özel filtreyle filtrelendi',
  filterRelations: {
    and: 'VE',
    or: 'VEYA',
    andOrFormulaApplied: 'VE/VEYA formülü uygulandı',
  },
  drilldown: {
    drillMenuItem: 'Detaylandır',
    breadcrumbsAllSuffix: 'Tümü',
    breadcrumbsPrev: 'Önceki',
    breadcrumbsNext: 'Sonraki',
    popover: {
      members: 'Üyeler',
      table: 'Tablo',
      column: 'Sütun',
    },
  },
  widgetHeader: {
    info: {
      details: 'Widget ayrıntıları',
      tooltip: 'Tam ayrıntıları görmek için tıklayın',
    },
    menu: {
      deleteWidget: "Widget'ı sil",
      distributeEqualWidth: 'Bu satırda eşit olarak dağıt',
    },
  },
  customWidgets: {
    registerPrompt:
      "Bilinmeyen özel widget türü: {{customWidgetType}}. Lütfen bu özel widget'ı kaydedin.",
  },
  ai: {
    analyticsChatbot: 'Analitik sohbet robotu',
    dataTopics: 'Veri konuları',
    chatbotDescription:
      'Analitik sohbet robotu, doğal dil kullanarak verilerinizle etkileşim kurmanıza yardımcı olmak için tasarlanmıştır.',
    topicSelectPrompt: 'Keşfetmek istediğiniz bir konu seçin:',
    preview: 'Önizleme',
    clearHistoryPrompt: 'Bu sohbeti temizlemek istiyor musunuz?',
    config: {
      inputPromptText: 'Bir soru sorun veya fikirler için "/" yazın',
      welcomeText:
        "Analitik Asistan'a hoş geldiniz! Verilerinizi keşfetmenize ve içgörüler elde etmenize yardımcı olabilirim.",
      suggestionsWelcomeText: 'Sahip olabileceğiniz bazı sorular:',
    },
    buttons: {
      insights: 'İçgörüler',
      correctResponse: 'Doğru yanıt',
      incorrectResponse: 'Yanlış yanıt',
      clearChat: 'Sohbeti temizle',
      refresh: 'Yenile',
      readMore: 'Daha fazla oku',
      collapse: 'Daralt',
      yes: 'Evet',
      no: 'Hayır',
      seeMore: 'Daha fazla gör',
    },
    disclaimer: {
      poweredByAi:
        'İçerik AI tarafından desteklenmektedir, bu nedenle sürprizler ve hatalar mümkündür.',
      rateRequest: 'Lütfen yanıtları değerlendirin, böylece gelişebiliriz!',
    },
    errors: {
      chatUnavailable: 'Sohbet kullanılamıyor. Lütfen daha sonra tekrar deneyin.',
      fetchHistory: 'Bir şeyler ters gitti ve sohbet konuşmasını alınamadı. Baştan başlayalım!',
      recommendationsNotAvailable:
        'Öneriler şu anda kullanılamıyor. Birkaç dakika sonra tekrar deneyin.',
      insightsNotAvailable: 'Kullanılabilir içgörü yok.',
      VectorDBEmptyResponseError:
        'AI yapılandırması henüz hazır değil, lütfen birkaç dakika bekleyin ve tekrar deneyin.',
      LlmBadConfigurationError:
        'LLM yapılandırması yanlış. LLM sağlayıcı yapılandırmasını güncellemek için yöneticinize ulaşın.',
      ChartTypeUnsupportedError: 'İstenen grafik türü desteklenmiyor.',
      BlockedByLlmContentFiltering:
        'Bu soru içerik yönetim politikamız tarafından engellenmiştir. Lütfen farklı bir soru deneyin.',
      LlmContextLengthExceedsLimitError:
        'Görünüşe göre mesaj uzunluk sınırına ulaştınız, lütfen bu konuşmayı temizleyin.',
      UserPromptExeedsLimitError:
        'İstem sınırı aşıyor. Sorunuzu yeniden ifade edin ve daha kısa bir istem kullanın.',
      unexpectedChatResponse:
        'Hay aksi, bir şeyler ters gitti. Lütfen daha sonra tekrar deneyin veya farklı bir soru deneyin.',
      unexpected: 'Hay aksi, bir şeyler ters gitti. Lütfen daha sonra tekrar deneyin.',
      unknownResponse: 'Bilinmeyen responseType alındı, ham yanıt=',
      invalidInput: 'Geçersiz giriş',
      noAvailableDataTopics:
        'Sağlanan veri modellerinden veya perspektiflerden hiçbiri kullanılabilir değil',
    },
  },
  attribute: {
    datetimeName: {
      years: '{{columnName}} içindeki yıllar',
      quarters: '{{columnName}} içindeki çeyrekler',
      months: '{{columnName}} içindeki aylar',
      weeks: '{{columnName}} içindeki haftalar',
      days: '{{columnName}} içindeki günler',
      hours: '{{columnName}} içindeki saatler',
      minutes: '{{columnName}} içindeki dakikalar',
    },
  },
  filterEditor: {
    buttons: {
      apply: 'Uygula',
      cancel: 'İptal',
      selectAll: 'Tümünü seç',
      clearAll: 'Tümünü temizle',
    },
    labels: {
      includeAll: 'Tümünü dahil et (filtre uygulanmadı)',
      allowMultiSelection: 'Listeler için çoklu seçime izin ver',
      from: 'Başlangıç',
      to: 'Bitiş',
      includeCurrent: 'Mevcut dahil',
    },
    placeholders: {
      selectFromList: 'Listeden seç',
      enterEntry: 'Girdinizi yazın...',
      enterValue: 'Değer girin...',
      select: 'Seç',
    },
    conditions: {
      exclude: 'Değildir',
      contains: 'İçerir',
      notContain: 'İçermez',
      startsWith: 'İle başlar',
      notStartsWith: 'İle başlamaz',
      endsWith: 'İle biter',
      notEndsWith: 'İle bitmez',
      equals: 'Eşittir',
      notEquals: 'Eşit değildir',
      isEmpty: 'Boştur',
      isNotEmpty: 'Boş değildir',
      lessThan: 'Küçüktür',
      lessThanOrEqual: 'Eşit veya küçüktür',
      greaterThan: 'Büyüktür',
      greaterThanOrEqual: 'Eşit veya büyüktür',
      isWithin: 'İçindedir',
    },
    validationErrors: {
      invalidNumber: 'Yalnızca sayılar',
      invalidNumericRange: '"Bitiş", "Başlangıç"tan büyük olmalıdır',
    },
    datetimeLevels: {
      year: 'Yıl',
      quarter: 'Çeyrek',
      month: 'Ay',
      week: 'Hafta',
      day: 'Gün',
      aggrigatedHour: 'Saat (toplu)',
      aggrigatedMinutesRoundTo15: '15 dk (toplu)',
    },
    relativeTypes: {
      last: 'Son',
      this: 'Bu',
      next: 'Sonraki',
    },
    datetimePositions: {
      before: 'Önce',
      after: 'Sonra',
    },
  },
  dataBrowser: {
    addFilter: 'Filtre ekle',
    selectField: 'Alan seç',
    configureFilter: 'Filtreyi yapılandır',
    noResults: 'Sonuç yok',
    searchPlaceholder: 'Ara',
  },
  pivotTable: {
    grandTotal: 'Genel toplam',
    subTotal: '{{value}} Toplamı',
    limits: {
      baseNote:
        'Toplamlar, pano sahibi tarafından ayarlandıysa, tam verilere atıfta bulunabilir. Kullanılabilirse, daha az satır ve sütun göstermek için filtreler kullanabilirsiniz.',
      rowsLimit: 'Pivot tablosu {{recordsCount}} kayıtla sınırlıdır',
      columnsLimit: 'Pivot tablosu {{columnsCount}} sütunla sınırlıdır',
      columnsAndRowsLimit:
        'Pivot tablosu {{recordsCount}} kayıt ve {{columnsCount}} sütunla sınırlıdır',
    },
  },
  dashboard: {
    toolbar: {
      undo: 'Geri al',
      redo: 'Yinele',
      cancel: 'İptal',
      apply: 'Uygula',
      editLayout: 'Düzeni düzenle',
      viewMode: 'Görüntüleme moduna geç',
      showFilters: 'Filtreleri göster',
      hideFilters: 'Filtreleri gizle',
      columns: 'Sütunlar',
      column: 'Sütun',
    },
  },
  jumpToDashboard: {
    defaultCaption: 'Atla',
    jumpableTooltip: 'Bu widget atlanabilir',
  },
  calendarHeatmap: {
    navigation: {
      firstMonth: 'İlk ay',
      lastMonth: 'Son ay',
      previousMonth: 'Önceki ay',
      nextMonth: 'Sonraki ay',
      previousGroup: 'Önceki grup',
      nextGroup: 'Sonraki grup',
    },
  },
};

export default [
  {
    language: 'tr-TR',
    namespace: SDK_UI_NAMESPACE,
    resources: translation,
  },
];
