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
 * A demo component that demonstrates the integration of Onyx Query Composer and CSDK.
 */
export function OnyxChatToCodeDemo() {
  return (
    <AiContextProvider>
      <OnyxChatToCode contextTitle={DEFAULT_CONTEXT_TITLE} defaultQueryYaml={DEFAULT_QUERY_YAML} />
    </AiContextProvider>
  );
}

interface OnyxChatToCodeProps {
  contextTitle: string;
  defaultQueryYaml: string;
}
// eslint-disable-next-line complexity
function OnyxChatToCode({ contextTitle, defaultQueryYaml }: OnyxChatToCodeProps) {
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
    <div className="csdk-flex csdk-w-full csdk-h-[90dvh]">
      <div className="csdk-flex csdk-flex-col csdk-flex-1 csdk-border">
        <div className="csdk-h-1/2 csdk-border">
          <div className="csdk-flex csdk-justify-between csdk-items-center csdk-px-2">
            <h3>Query in YAML:</h3>
            <button onClick={handleRunQuery}>Run</button>
          </div>
          <Editor
            value={queryYaml}
            defaultLanguage="yaml"
            onMount={handleQueryEditorDidMount}
            theme="vs-dark"
            options={DEFAULT_EDITOR_OPTS}
          />
        </div>
        <div className="csdk-h-1/2 csdk-border">
          <Chatbot
            width={700}
            height={600}
            config={{
              defaultContextTitle: contextTitle,
              enableFollowupQuestions: false,
              numOfRecommendations: 0,
              chatMode: 'develop',
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
        <div className="csdk-h-1/2 csdk-border">
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
  );
}
