/* eslint-disable sonarjs/no-duplicate-string -- Locale strings deliberately repeat across
   unrelated keys and across CLDR plural forms this language does not distinguish (Time
   Frame's `_few`/`_many` mirroring `_other`). Constants would fragment the translations. */
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
  notifications: {
    dismiss: 'Bildirimi kapat',
    auth: {
      sessionExpiredTitle: 'Oturum süresi doldu',
      sessionExpiredMessage: 'Oturumunuzun süresi doldu. Devam etmek için yeniden oturum açın.',
      authenticationFailedTitle: 'Kimlik doğrulama başarısız',
      authenticationFailedMessage:
        'Sağlanan kimlik bilgileri Sisense örneği tarafından reddedildi.',
    },
    permission: {
      forbiddenTitle: 'Erişim reddedildi',
      forbiddenMessage: 'Bu verilere erişim izniniz yok.',
    },
    network: {
      unreachableTitle: 'Bağlantı sorunu',
      unreachableMessage: 'Sisense örneğine ulaşılamadı.',
    },
    server: {
      errorTitle: 'Sunucu hatası',
      errorMessage: 'Sisense örneği bir hata döndürdü. Daha sonra yeniden deneyin.',
    },
    general: {
      requestFailedTitle: 'İstek başarısız',
      requestFailedMessage: 'Sisense örneğine yapılan bir istek başarısız oldu.',
    },
  },
  errorBoxText: '$t(common:error): {{errorMessage}}',
  chartNoData: 'Sonuç yok',
  filters: 'Filtreler',
  cancel: 'İptal',
  includeAll: 'Tümünü dahil et',
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
    days: 'Gün',
    weeks: 'Hafta',
    months: 'Ay',
    quarters: 'Çeyrek Yıl',
    years: 'Yıl',
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
      max: 'Maks',
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
      trend: 'Trend',
      trendLocalValue: 'Yerel değer',
      confidenceInterval: 'Güven aralığı',
      trendType: 'Tür',
      trendDataKey: 'Trend Verileri',
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
      max: 'Maks',
    },
  },
  filterWidget: {
    placeholders: {
      setFilter: 'Filtre ayarla',
    },
    dateRange: {
      from: 'Başlangıç',
      to: 'Bitiş',
      invertedFrom: 'Bitiş tarihinden önce olmalı',
      invertedTo: 'Başlangıç tarihinden sonra olmalı',
    },
    numberRange: {
      minimum: 'Minimum',
      maximum: 'Maksimum',
      notSet: 'Ayarlanmadı',
      clear: '{{field}} temizle',
    },
    selectedCount: '{{count}} seçildi',
    allExceptCount: '{{count}} hariç tümü',
    setupTitle: "Filtre widget'ını ayarlayın",
    setupSubtitle: 'Bir boyut seçin ve filtrenin nasıl çalışacağını yapılandırın',
    emptySetup: 'Filtreyi ayarla',
    conditionUnsupported: 'Koşul metin, sayısal ve tarih alanları için kullanılabilir',
    dateCondition: {
      onOrBefore: 'Bu tarihte veya önce',
      onOrAfter: 'Bu tarihte veya sonra',
      includingCurrent: 'mevcut dahil',
      includingCurrentLabel: 'Mevcut dahil',
      countMin: '1 veya daha büyük bir tam sayı girin',
      /**
       * Turkish is postpositional (date before önce/sonra) and does not pluralize a noun
       *  that follows an explicit count ("Son 3 Yıl", not "Son 3 Yıllar") — see datetimeLevels.
       */
      summary: {
        current: '{{- operator}} {{- grain}}',
        relative: '{{- operator}} {{- count}} {{- grain}}',
        relativeIncludingCurrent: '{{- operator}} {{- count}} {{- grain}} {{- includingCurrent}}',
        date: '{{- date}} {{- operator}}',
      },
    },
    conditionNotRepresentable: 'Bu koşul burada düzenlenemez',
    controls: {
      findInList: 'Listede ara',
      enterValue: 'Değer girin...',
      noMatches: 'Eşleşme yok',
      clearSelection: 'Seçimi temizle',
      overflowCount: '+{{count}}',
      select: 'Seçin',
      selectDateLevel: 'Tarih düzeyi seçin',
      selectCondition: 'Koşul seç',
      selectConnector: 'VE/VEYA seç',
      addCondition: '+ Koşul ekle',
      fillOrRemoveCondition: 'Doldurun veya koşulu kaldırın',
      rangeOrderError: 'İkinci değer birinciden büyük olmalıdır',
      betweenMin: 'Minimum',
      betweenMax: 'Maksimum',
      increaseCount: 'Artır',
      decreaseCount: 'Azalt',
      selectValues: '{{level}} seçin',
      clear: 'Temizle',
    },
    timeFrame: {
      /** Accessible name for the row-list popover — read to a screen reader on open. */
      listboxLabel: 'Zaman aralığı seçenekleri',
      /**
       * Row labels. Two shapes carry a `{{count}}`, which i18next resolves to the
       * `_one` (singular) or `_other` (plural) key by CLDR plural rules. Locales
       * with more plural forms — Russian's `_few`/`_many`, Polish's `_many` — add
       * more suffixes in their own resources; English needs only the two.
       */
      labels: {
        /** Day-grain count=1: `Today` / `Yesterday` / `Tomorrow` — calendar words, not arithmetic. */
        today: 'Bugün',
        yesterday: 'Dün',
        tomorrow: 'Yarın',
        /** `This X` — single period, no count in the label. Day has none (Today covers it). */
        this: {
          week: 'Bu hafta',
          month: 'Bu ay',
          quarter: 'Bu çeyrek',
          year: 'Bu yıl',
        },
        /**
         * `Last X` / `Last N X` — count drops for the singular, plural interpolates it.
         * Day `_one` renders as `Yesterday` and never reaches this key.
         * Turkish does not pluralize a noun after an explicit count — "Son 3 hafta", not "haftalar".
         */
        last: {
          week_one: 'Geçen hafta',
          week_few: 'Son {{count}} hafta',
          week_many: 'Son {{count}} hafta',
          week_other: 'Son {{count}} hafta',
          month_one: 'Geçen ay',
          month_few: 'Son {{count}} ay',
          month_many: 'Son {{count}} ay',
          month_other: 'Son {{count}} ay',
          quarter_one: 'Geçen çeyrek',
          quarter_few: 'Son {{count}} çeyrek',
          quarter_many: 'Son {{count}} çeyrek',
          quarter_other: 'Son {{count}} çeyrek',
          year_one: 'Geçen yıl',
          year_few: 'Son {{count}} yıl',
          year_many: 'Son {{count}} yıl',
          year_other: 'Son {{count}} yıl',
          day_few: 'Son {{count}} gün',
          day_many: 'Son {{count}} gün',
          day_other: 'Son {{count}} gün',
        },
        /** `Next X` / `Next N X`. Day `_one` renders as `Tomorrow`. */
        next: {
          week_one: 'Gelecek hafta',
          week_few: 'Sonraki {{count}} hafta',
          week_many: 'Sonraki {{count}} hafta',
          week_other: 'Sonraki {{count}} hafta',
          month_one: 'Gelecek ay',
          month_few: 'Sonraki {{count}} ay',
          month_many: 'Sonraki {{count}} ay',
          month_other: 'Sonraki {{count}} ay',
          quarter_one: 'Gelecek çeyrek',
          quarter_few: 'Sonraki {{count}} çeyrek',
          quarter_many: 'Sonraki {{count}} çeyrek',
          quarter_other: 'Sonraki {{count}} çeyrek',
          year_one: 'Gelecek yıl',
          year_few: 'Sonraki {{count}} yıl',
          year_many: 'Sonraki {{count}} yıl',
          year_other: 'Sonraki {{count}} yıl',
          day_few: 'Sonraki {{count}} gün',
          day_many: 'Sonraki {{count}} gün',
          day_other: 'Sonraki {{count}} gün',
        },
        /** Paired frames — include the current period. Day grain has no such pair. */
        thisAndLast: {
          week: 'Bu hafta ve geçen hafta',
          month: 'Bu ay ve geçen ay',
          quarter: 'Bu çeyrek ve geçen çeyrek',
          year: 'Bu yıl ve geçen yıl',
        },
        thisAndNext: {
          week: 'Bu hafta ve gelecek hafta',
          month: 'Bu ay ve gelecek ay',
          quarter: 'Bu çeyrek ve gelecek çeyrek',
          year: 'Bu yıl ve gelecek yıl',
        },
      },
    },
    calendar: {
      selectDates: 'Tarih seçin',
      multipleDaysHint: 'Birden fazla gün seçebilirsiniz',
      formatError: '{{- format}} biçimini kullanın',
      nonexistent: 'Bu tarih mevcut değil',
      chooseDate: 'Tarih seç',
      chooseDates: 'Tarihleri seç',
      previousMonth: 'Önceki ay',
      nextMonth: 'Sonraki ay',
      previousYear: 'Önceki yıl',
      nextYear: 'Sonraki yıl',
      openCalendar: 'Takvimi aç',
      clearDate: 'Tarihi temizle',
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
    addTitle: 'Başlık ekle',
    info: {
      details: 'Widget ayrıntıları',
      tooltip: 'Tam ayrıntıları görmek için tıklayın',
    },
    chartTableToggle: {
      switchToTable: 'Tabloya geç',
      switchToChart: 'Grafiğe geç',
    },
    menu: {
      deleteWidget: "Widget'ı sil",
      duplicateWidget: "Widget'ı çoğalt",
      renameWidget: "Widget'ı yeniden adlandır",
      distributeEqualWidth: 'Bu satıra eşit olarak dağıt',
      download: 'İndir',
      csvFile: 'CSV dosyası',
      excelFile: 'Excel dosyası',
      repeatRowsRecommended: 'Satırları tekrarla (Önerilen)',
      mergeRows: 'Satırları birleştir',
    },
  },
  customWidgets: {
    registerPrompt:
      "Bilinmeyen özel widget türü: {{customWidgetType}}. Lütfen bu özel widget'ı kaydedin.",
  },
  narrativeWidget: {
    generate: 'Anlatı Oluştur',
    regenerate: 'Yeniden Oluştur',
    retry: 'Oluşturmayı Yeniden Dene',
    disclaimer: 'İçerik AI tarafından desteklenmektedir, bu nedenle hatalar mümkündür.',
    updatedAt: 'Güncellendi: {{timestamp}}',
    copy: 'Panoya kopyala',
    copied: 'Kopyalandı',
    creditsUsed: "AI kredilerinin %{{usagePercentage}}'i kullanıldı.",
    noDataTitle: 'Kullanılabilir pano verisi yok',
    noDataDescription: 'Pano verileri kullanılabilir olduğunda bir anlatı oluşturabilirsiniz.',
    failedTitle: 'Anlatı oluşturulamadı',
    failedDescription:
      'Lütfen daha sonra tekrar deneyin. Sorun devam ederse yöneticinizle iletişime geçin.',
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
      readMore: 'Daha fazla göster',
      collapse: 'Daralt',
      yes: 'Evet',
      no: 'Hayır',
      seeMore: 'Daha fazla gör',
      generateNarrative: 'Yapay Zeka Anlatısı Oluştur',
      hideNarrative: 'Yapay Zeka Anlatısını Gizle',
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
      failedToFetchCreditBalance: 'Kredi bakiyesi alınamadı',
    },
    quota: {
      exceededErrorTitle: 'AI yanıtları şu anda kullanılamıyor.',
      exceededErrorDescription:
        'Şirketinizin aylık AI kotasına ulaştınız. Kota bir sonraki aylık kullanım döngünüzde otomatik olarak yenilenecektir.',
      warningDescription: "Şirketinizin aylık AI kotasının %{{usagePercentage}}'ini kullandınız.",
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
    tooltips: {
      selectAllPartiallyLoaded:
        'Tüm değerler görüntülenmiyor. Kalan değerleri yüklemek için listeyi aşağı kaydırın. Belirli değerleri hariç tutmak için aşağıdaki "Değildir" koşulunu da kullanabilirsiniz.',
    },
    labels: {
      includeAll: 'Tümünü dahil et (filtre uygulanmadı)',
      allowMultiSelection: 'Listeler için çoklu seçime izin ver',
      from: 'Başlangıç',
      to: 'Bitiş',
      includeCurrent: 'Mevcut dahil',
      rankedBy: 'Sıralama ölçütü',
      selectField: 'Alan seç',
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
      between: 'Arasında',
      top: 'İlk',
      bottom: 'Son',
    },
    validationErrors: {
      invalidNumber: 'Yalnızca sayılar',
      invalidNumericRange: '"Bitiş", "Başlangıç"tan büyük olmalıdır',
    },
    datetimeLevels: {
      /* Turkish does not mark plural on a noun that follows an explicit count
       * ("3 yıl", not "3 yıllar") — `_other` intentionally stays singular. */
      year: 'Yıl',
      year_one: 'Yıl',
      year_few: 'Yıl',
      year_many: 'Yıl',
      year_other: 'Yıl',
      quarter: 'Çeyrek',
      quarter_one: 'Çeyrek',
      quarter_few: 'Çeyrek',
      quarter_many: 'Çeyrek',
      quarter_other: 'Çeyrek',
      month: 'Ay',
      month_one: 'Ay',
      month_few: 'Ay',
      month_many: 'Ay',
      month_other: 'Ay',
      week: 'Hafta',
      week_one: 'Hafta',
      week_few: 'Hafta',
      week_many: 'Hafta',
      week_other: 'Hafta',
      day: 'Gün',
      day_one: 'Gün',
      day_few: 'Gün',
      day_many: 'Gün',
      day_other: 'Gün',
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
    more: 'Daha fazla...',
    filter: 'Filtre',
    addMeasure: 'Ölçüm ekle',
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
  filterTile: {
    menu: {
      lock: 'Kilitle',
      unlock: 'Kilidi Aç',
      lockGroup: 'Grubu Kilitle',
      unlockGroup: 'Grubun Kilidini Aç',
    },
    toggleSwitch: 'Filtreyi etkinleştir/devre dışı bırak',
    linkedToWidget: {
      label: "Filtre widget'ına bağlı",
      tooltip: 'Bu filtre filtre panelinden düzenlenemez. Değerleri doğrudan panoda değiştirin.',
      infoAriaLabel: "Filtre widget'ı bağlantısı bilgisi",
    },
  },
  chart: {
    indicator: {
      label: 'Gösterge grafiği',
    },
    visualization: {
      label: 'Veri görselleştirme',
    },
    pivotTable: {
      label: 'Pivot tablo',
    },
    table: {
      label: 'Veri tablosu',
      totalRows: 'Toplam: {{formattedCount}} satır',
      rowsRange: '{{start}}-{{end}}. satırlar',
    },
    sankey: {
      alerts: {
        tooManyStages:
          'Sankey grafiğinde {{stageCount}} aşama var; {{softLimit}} değerinden fazlası genellikle okunamaz bir diyagram üretir. Daha az kategori sütunu veya daha sıkı filtreler kullanın.',
      },
    },
  },
  kpi: {
    comparison: {
      vsPriorYear: 'önceki yıla göre',
      vsPriorQuarter: 'önceki çeyreğe göre',
      vsPriorMonth: 'önceki aya göre',
      vsPriorWeek: 'önceki haftaya göre',
      vsPriorDay: 'önceki güne göre',
      vsPriorPeriod: 'önceki döneme göre',
      vsBaseline: '{{label}} ile karşılaştırma',
      withBaseline: '{{label}} ({{baseline}})',
    },
    target: {
      ofGoal: 'hedefe göre {{percent}} ({{goalValue}})',
      toGo: '{{value}} kaldı',
    },
    percentFormat: '{{sign}}%{{value}}',
  },
  loadingOverlay: {
    label: 'İçerik yükleniyor',
  },
  queryDefinition: {
    showMorePills: '{{count}} tane daha göster',
    showLess: 'Daha az göster',
    connectorBy: 'göre',
    connectorWhere: 'koşul',
    tooltipType: 'Tür',
    tooltipColumn: 'Sütun',
    tooltipFormula: 'Formül',
    filterPill: {
      customFilter: 'özel filtre',
      empty: 'boş',
      notEmpty: 'boş değil',
      not: '{{value}} değil',
      and: 've',
      or: 'veya',
      moreValues: '{{values}} +{{count}} daha',
      range: '{{from}} - {{to}}',
      fromToLatest: '{{from}} - en geç tarih',
      earliestTo: 'en erken tarih - {{to}}',
      dependentOn: '{{parents}} öğesine bağlı',
      dependentFilter: 'bağımlı filtre',
      text: {
        contains: '{{value}} içerir',
        startsWith: '{{value}} ile başlar',
        endsWith: '{{value}} ile biter',
        doesntEqual: '{{value}} değerine eşit değil',
        doesntStartWith: '{{value}} ile başlamaz',
        doesntContain: '{{value}} içermez',
        doesntEndWith: '{{value}} ile bitmez',
        like: '{{value}} benzeri',
      },
      ranking: {
        top: 'İlk {{count}}',
        bottom: 'Son {{count}}',
        by: '{{measure}} göre {{rank}}',
      },
      relative: {
        last: 'son {{count}} {{unit}}',
        next: 'sonraki {{count}} {{unit}}',
        lastTo: '{{date}} tarihine kadar son {{count}} {{unit}}',
        nextFrom: '{{date}} tarihinden itibaren {{count}} {{unit}}',
        includingCurrent: '{{period}} (mevcut dahil)',
        withOffset: '{{period}}, kaydırma {{offset}}',
        today: 'bugün',
        thisWeek: 'bu hafta',
        thisMonth: 'bu ay',
        thisQuarter: 'bu çeyrek',
        thisYear: 'bu yıl',
      },
      units: {
        year_one: 'yıl',
        year_few: 'yıl',
        year_many: 'yıl',
        year_other: 'yıl',
        quarter_one: 'çeyrek',
        quarter_few: 'çeyrek',
        quarter_many: 'çeyrek',
        quarter_other: 'çeyrek',
        month_one: 'ay',
        month_few: 'ay',
        month_many: 'ay',
        month_other: 'ay',
        week_one: 'hafta',
        week_few: 'hafta',
        week_many: 'hafta',
        week_other: 'hafta',
        day_one: 'gün',
        day_few: 'gün',
        day_many: 'gün',
        day_other: 'gün',
        hour_one: 'saat',
        hour_few: 'saat',
        hour_many: 'saat',
        hour_other: 'saat',
        minute_one: 'dakika',
        minute_few: 'dakika',
        minute_many: 'dakika',
        minute_other: 'dakika',
      },
    },
  },
  measures: {
    countShort: '{{level}} sayısı',
    countDistinct: 'Benzersizleri Say',
    count: 'Tümünü say',
    average: 'Ortalama',
    sum: 'Toplam',
    min: 'Min',
    max: 'Maks',
    stdev: 'Standart sapma',
    median: 'Medyan',
    variance: 'Varyans',
  },
  measuresAgg: {
    countDistinct: '# benzersiz',
    count: '#',
    sum: 'Toplam',
    average: 'Ortalama',
    min: 'Min',
    max: 'Maks',
    median: 'Medyan',
    variance: 'Varyans',
    stdev: 'Standart sapma',
  },
};

export default [
  {
    language: 'tr-TR',
    namespace: SDK_UI_NAMESPACE,
    resources: translation,
  },
];
