import { NavSideStyle } from '../../styles';
import { NavLink } from 'react-router-dom';
import {
  MdExplore,
  MdBuild,
  MdSettings,
  MdAddToQueue,
  MdPlaylistAddCheck,
  MdBook,
  MdFilterAlt,
  MdAccessAlarm,
  MdBubbleChart,
  Md123,
  MdArrowForward,
  MdOutlineMergeType,
  MdDonutSmall,
  MdRestaurant,
  MdMenuBook,
  MdArticle,
  MdDashboard,
  MdAnimation,
  MdCalendarMonth,
} from 'react-icons/md';
import logo from '../../images/logo_w.svg';

const links = [
  {
    text: '',
    icon: <MdAccessAlarm />,
  },
  {
    text: 'query-driven-chart',
    icon: <MdAddToQueue />,
  },
  {
    text: 'cross-filtering',
    icon: <MdExplore />,
  },
  {
    text: 'dashboard-widget',
    icon: <MdPlaylistAddCheck />,
  },
  {
    text: 'article',
    icon: <MdArticle />,
  },
  {
    text: 'infuse-app',
    icon: <MdDashboard />,
  },
  {
    text: 'Penguins',
    icon: <MdAnimation />,
  },
  {
    text: 'wafer-maps',
    icon: <MdDonutSmall />,
  },
  {
    text: 'date-range-filter',
    icon: <MdCalendarMonth />,
  },
  {
    text: 'page6',
    icon: <MdSettings />,
  },
  {
    text: 'page7',
    icon: <MdBuild />,
  },
  {
    text: 'page8',
    icon: <MdBook />,
  },
  {
    text: 'page9',
    icon: <MdFilterAlt />,
  },
  {
    text: 'page10',
    icon: <MdArrowForward />,
  },
  {
    text: 'page11',
    icon: <MdOutlineMergeType />,
  },
  {
    text: 'indicator-gallery',
    icon: <Md123 />,
  },
  {
    text: 'page13',
    icon: <MdBubbleChart />,
  },
  {
    text: 'page14',
    icon: <MdRestaurant />,
  },
  {
    text: 'page16',
    icon: <MdMenuBook />,
  },
];
export const NavSide = (): JSX.Element => {
  return (
    <NavSideStyle>
      <NavLink to={'/sisense'}>
        <img src={logo} alt={'sisense logo'} />
      </NavLink>
      {links.map((linkItem, index) => {
        return (
          <NavLink
            key={`nav-${index}`}
            to={`/${linkItem.text.toLowerCase()}`}
            className={({ isActive }) => (isActive ? 'selected' : '')}
          >
            {linkItem.icon}
          </NavLink>
        );
      })}
    </NavSideStyle>
  );
};
