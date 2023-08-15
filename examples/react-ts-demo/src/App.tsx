import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NavSide } from './components/navigation/NavSide';
import { NavBar } from './components/navigation/NavBar';
import { MyContext } from './context';
import { MainWrapper, RightContent } from './styles';
import * as store from './store';
import { PageChartGallery } from './components/PageChartGallery';
import { PageQueryDrivenChart } from './components/PageQueryDrivenChart';
import { PageCrossFiltering } from './components/PageCrossFiltering';
import { PageDashboardWidget } from './components/PageDashboardWidget';
import { PageWaferMaps } from './components/PageWaferMaps';
import { Page6 } from './components/Page6';
import { Page7 } from './components/Page7';
import { Page8 } from './components/Page8';
import { Page9 } from './components/Page9';
import { Page10 } from './components/Page10';
import { Page11 } from './components/Page11';
import { IndicatorGallery } from './components/IndicatorGallery';
import { Page13 } from './components/Page13';
import { Page14 } from './components/Page14';
import { Page16 } from './components/Page16';
import { DateRangeFiltersPage } from './components/DateRangeFiltersPage';
import { InfuseApp } from './components/InfuseApp';
import { PageBlogArticle } from './components/PageBlogArticle';
import { Penguins } from './components/Penguins';

function App() {
  const [active, setActiveUser] = useState(0);
  const [isShowing, setShowing] = useState(false);
  const changeActive = (userNum: number) => setActiveUser(userNum);
  const toggleUserPopUp = () => setShowing((isActive) => !isActive);

  return (
    <MyContext.Provider value={{ store, active, changeActive, isShowing, toggleUserPopUp }}>
      <Router>
        <MainWrapper>
          <NavSide />
          <RightContent>
            <NavBar />
            <Routes>
              <Route path="/" element={<PageChartGallery />} />
              <Route path="/chart-gallery" element={<PageChartGallery />} />
              <Route path="/query-driven-chart" element={<PageQueryDrivenChart />} />
              <Route path="/cross-filtering" element={<PageCrossFiltering />} />
              <Route path="/dashboard-widget" element={<PageDashboardWidget />} />
              <Route path="/wafer-maps" element={<PageWaferMaps />} />
              <Route path="/article" element={<PageBlogArticle />} />
              <Route path="/infuse-app" element={<InfuseApp />} />
              <Route path="/penguins" element={<Penguins />} />
              <Route path="/page6" element={<Page6 />} />
              <Route path="/page7" element={<Page7 />} />
              <Route path="/page8" element={<Page8 />} />
              <Route path="/page9" element={<Page9 />} />
              <Route path="/page10" element={<Page10 />} />
              <Route path="/page11" element={<Page11 />} />
              <Route path="/indicator-gallery" element={<IndicatorGallery />} />
              <Route path="/page13" element={<Page13 />} />
              <Route path="/page14" element={<Page14 />} />
              <Route path="/page16" element={<Page16 />} />
              <Route path="/date-range-filter" element={<DateRangeFiltersPage />} />
            </Routes>
          </RightContent>
        </MainWrapper>
      </Router>
    </MyContext.Provider>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const env: Record<string, string> =
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  typeof (import.meta as any).env !== 'undefined' ? (import.meta as any).env : process.env;

export const getEnvWidgets = (): string => env.REACT_APP_WIDGETS ?? env.VITE_APP_WIDGETS ?? '';

export const getEnvURL = (): string => env.REACT_APP_SISENSE_URL ?? env.VITE_APP_SISENSE_URL;

export default App;
