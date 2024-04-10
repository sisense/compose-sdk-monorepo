import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import {
  AiContextProvider,
  Chatbot,
  ModelTranslator,
  QueryTranslator,
  useGetDataSource,
} from '@/ai';
import { ChartWidget } from '@/widgets/chart-widget';
import { useChatSession } from '@/ai/use-chat-session';
import { TableWidget } from '@/widgets/table-widget';
import { UiFramework } from '@/ai/translators/types';
import { ThemeProvider } from '@/theme-provider';
import { getTheme } from './helpers/get-theme';

const DEFAULT_EDITOR_OPTS = {
  contextmenu: false,
  tabSize: 2,
  formatOnPaste: true,
};

const DEFAULT_CONTEXT_TITLE = 'Sample ECommerce';

const DEFAULT_QUERY_YAML = `# bar chart of total of revenue by condition

model: Sample ECommerce
metadata:
  - jaql:
      dim: "[Commerce.Condition]"
      title: Condition
  - jaql:
      dim: "[Commerce.Revenue]"
      agg: sum
      title: total of Revenue
  - jaql:
      dim: "[Country.Country]"
      filter:
        members:
          - Cambodia
          - United States
    panel: scope
  - jaql:
      dim: "[Commerce.Date (Calendar)]"
      level: years
      filter:
        members:
          - "2013-01-01T00:00:00"
    panel: scope
  - jaql:
      dim: "[Commerce.Revenue]"
      filter:
        fromNotEqual: 1000
    panel: scope
chart:
  chartType: bar
  dataOptions:
    category:
      - name: Condition
    value:
      - name: total of Revenue`;

/**
 * A demo component that demonstrates the integration of Forge Query Composer and CSDK.
 */
export function ChatToCodeDemo() {
  const isDarkMode = true;
  const theme = getTheme(isDarkMode);
  return (
    <AiContextProvider>
      <ThemeProvider theme={theme}>
        <ChatToCode contextTitle={DEFAULT_CONTEXT_TITLE} defaultQueryYaml={DEFAULT_QUERY_YAML} />
      </ThemeProvider>
    </AiContextProvider>
  );
}

interface ChatToCodeProps {
  contextTitle: string;
  defaultQueryYaml: string;
}
// eslint-disable-next-line complexity
function ChatToCode({ contextTitle, defaultQueryYaml }: ChatToCodeProps) {
  const [queryYaml, setQueryYaml] = useState(defaultQueryYaml);
  const [selectedUiFramework, setSelectedUiFramework] = useState<UiFramework>('react');
  const queryEditorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const codeEditorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const { data: dataSourceFields, isLoading } = useGetDataSource(contextTitle);

  const queryTranslator = useMemo(
    () => new QueryTranslator(contextTitle, dataSourceFields ?? []),
    [contextTitle, dataSourceFields],
  );

  // In AI mode, retrieve the query model from last chat response and update the queryYaml
  const { lastNlqResponse } = useChatSession(contextTitle);
  useEffect(() => {
    if (!lastNlqResponse) {
      return;
    }

    // Chat response is in expanded query model. Translate it to simple query model.
    const aiQueryModel = queryTranslator.translateToSimple(lastNlqResponse);
    const aiQueryYaml = queryTranslator.stringifySimple(aiQueryModel);
    setQueryYaml(aiQueryYaml);
  }, [lastNlqResponse, queryTranslator]);

  const codeLanguage = selectedUiFramework === 'vue' ? 'html' : 'javascript';

  const { csdkCode, csdkChart } = useMemo(() => {
    // parse simple query YAML to simple query model
    const simpleQueryModel = queryTranslator.parseSimple(queryYaml);
    // translate simple query model to expanded query model
    const expandedQueryModel = queryTranslator.translateToExpanded(simpleQueryModel);
    // translate expanded query model to CSDK chart and code
    const modelTranslator = new ModelTranslator(expandedQueryModel);
    const csdkChart = modelTranslator.toChart();
    const csdkCode = csdkChart ? modelTranslator.toCode(csdkChart, selectedUiFramework) : '';
    return {
      csdkCode,
      csdkChart,
    };
  }, [queryYaml, queryTranslator, selectedUiFramework]);

  // auto format the code editor
  const formatCode = () => {
    codeEditorRef.current?.getAction('editor.action.formatDocument')?.run();
  };

  const handleQueryEditorDidMount: OnMount = (editor) => {
    queryEditorRef.current = editor;
  };

  const handleCodeEditorDidMount: OnMount = (editor) => {
    codeEditorRef.current = editor;
    formatCode();
  };

  const handleRunQuery = useCallback(() => {
    const updatedQueryYaml = queryEditorRef.current?.getValue() || '';
    setQueryYaml(updatedQueryYaml);
  }, []);

  const handleUiFrameworkChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newUiFramework = event.target.value as UiFramework;
    setSelectedUiFramework(newUiFramework);
  };

  useEffect(() => {
    formatCode();
  });

  return (
    <div className="csdk-bg-black csdk-text-white csdk-flex csdk-w-full csdk-h-[90dvh]">
      <div className="csdk-flex csdk-flex-col csdk-flex-1 csdk-border">
        <div className="csdk-h-1/2 csdk-border csdk-flex csdk-flex-col csdk-z-1">
          <div className="csdk-flex csdk-justify-between csdk-items-center csdk-px-2">
            <h3>Query in YAML:</h3>
            <button onClick={handleRunQuery}>Run</button>
          </div>
          <div className="csdk-h-full csdk-min-h-0">
            <Editor
              value={queryYaml}
              defaultLanguage="yaml"
              onMount={handleQueryEditorDidMount}
              theme="vs-dark"
              options={DEFAULT_EDITOR_OPTS}
            />
          </div>
        </div>
        <div className="csdk-h-1/2 csdk-border csdk-z-0 csdk-border-0 csdk-overflow-hidden csdk-min-h-[435px] csdk-flex csdk-justify-center">
          <Chatbot
            height={600}
            width={800}
            config={{
              defaultContextTitle: contextTitle,
              enableFollowupQuestions: false,
              numOfRecommendations: 0,
              chatMode: 'develop',
            }}
            style={{
              backgroundColor: 'rgba(23, 28, 38, 1)',
              primaryTextColor: 'rgba(242, 247, 255, 0.9)',
              secondaryTextColor: 'rgba(242, 247, 255, 0.4)',
              messageBackgroundColor: 'rgba(46, 55, 77, 1)',
              inputBackgroundColor: 'rgba(31, 37, 51, 1)',
              border: false,
              suggestions: {
                textColor: 'rgba(88, 192, 244, 1)',
                border: '1px solid #2E374D',
                hoverBackgroundColor: 'rgba(242, 247, 255, 0.1)',
                loadingGradient: ['rgba(242, 247, 255, 0.1)', 'rgba(242, 247, 255, 0.3)'],
              },
              iconColor: 'rgba(242, 247, 255, 0.5)',
            }}
          />
        </div>
      </div>
      <div className="csdk-flex csdk-flex-1 csdk-flex-col">
        <div className="csdk-h-1/2 csdk-border">
          {!isLoading && csdkChart && csdkChart.chartType === 'table' && (
            <TableWidget {...csdkChart.getTableWidgetProps()} />
          )}
          {!isLoading && csdkChart && csdkChart.chartType !== 'table' && (
            <ChartWidget {...csdkChart.getChartWidgetProps()} />
          )}
        </div>
        <div className="csdk-h-1/2 csdk-border csdk-flex csdk-flex-col">
          <div className="csdk-flex csdk-justify-between csdk-items-center csdk-px-2">
            <h3>CSDK Code:</h3>
            <div>
              <select
                id="uiFrameworkSelect"
                value={selectedUiFramework}
                onChange={handleUiFrameworkChange}
                style={{ border: '1px solid grey', borderRadius: '5px' }}
              >
                <option value="react">React</option>
                <option value="angular">Angular</option>
                <option value="vue">Vue</option>
              </select>
            </div>
          </div>
          <div className="csdk-h-full csdk-min-h-0">
            <Editor
              language={codeLanguage}
              value={csdkCode}
              onMount={handleCodeEditorDidMount}
              theme="vs-dark"
              options={{
                ...DEFAULT_EDITOR_OPTS,
                // read-only will disable the auto-formatting
                readOnly: false,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
