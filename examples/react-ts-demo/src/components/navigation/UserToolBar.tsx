/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useState, useEffect } from 'react';
import { MyContext } from '../../context';
import { UserToolBarStyle, UserImageStyle, Button, UserWrapper } from '../../styles';
import { UserInfo } from './UserInfo';
import { MdLocationOn, MdNotificationsNone } from 'react-icons/md';
import { v4 as uuid4 } from 'uuid';
import FloatingPop from './FloatingPop';

export const UserToolBar = () => {
  const over: any = useContext(MyContext);
  const store = over;
  const [user, setUser] = useState(store.active);

  const userButtons = [
    {
      id: uuid4(),
      onClick: () => store.toggleUserPopUp(),
      custom: '#ffffff',
      shadow: false,
      title: 'Notifications',
      flex: true,
      align: true,
      color: '#000',
      fsize: '30px',
      padding: '0 20px 0 0',
      icon: <MdNotificationsNone />,
    },
    {
      id: uuid4(),
      onClick: () => store.toggleUserPopUp(),
      custom: '#ffffff',
      shadow: false,
      title: 'Location',
      flex: true,
      align: true,
      color: '#000',
      fsize: '30px',
      padding: '0 20px 0 0',
      icon: <MdLocationOn />,
    },
  ];
  useEffect(() => {
    setUser(store.active);
  }, [store.active]);
  return (
    <UserToolBarStyle>
      {userButtons.map((b) => (
        <Button key={b.id} {...b}>
          {b.icon}
        </Button>
      ))}
      <UserWrapper onClick={() => store.toggleUserPopUp()}>
        <UserImageStyle
          src={'/' + store.store.users[user].picture}
          title={store.store.users[user].title}
        />
        <UserInfo user={store.store.users[user]} />
      </UserWrapper>
      <FloatingPop showPop={store.isShowing}>
        <ul>
          {store.store.users.map((usr: any, i: any) => {
            return (
              <li
                key={i + 'list-key'}
                onClick={() => {
                  store.changeActive(i);
                  store.toggleUserPopUp();
                }}
              >
                <UserImageStyle src={'/' + usr.picture} title={usr.title} />
                <UserInfo user={usr} />
              </li>
            );
          })}
        </ul>
      </FloatingPop>
    </UserToolBarStyle>
  );
};
