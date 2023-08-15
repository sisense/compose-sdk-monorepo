/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { UserInfoStyle } from '../../styles';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const UserInfo = ({ user }: any) => {
  return (
    <UserInfoStyle>
      <h3>{user.name}</h3>
      <p>{user.employer}</p>
    </UserInfoStyle>
  );
};
