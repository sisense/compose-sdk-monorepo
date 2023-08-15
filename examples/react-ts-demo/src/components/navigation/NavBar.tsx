import { NavBarStyle } from '../../styles';
import { NavLink } from 'react-router-dom';
import { UserToolBar } from './UserToolBar';

export const NavBar = () => {
  return (
    <NavBarStyle>
      <NavLink
        to={'/'}
        className={({ isActive }) => (isActive ? 'selected' : '')}
      >
        {'Overview'}
      </NavLink>
      <UserToolBar />
    </NavBarStyle>
  );
};
