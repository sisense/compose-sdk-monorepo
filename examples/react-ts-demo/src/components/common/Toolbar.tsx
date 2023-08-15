import { ReactNode } from 'react';
import { MdCancelPresentation } from 'react-icons/md';

export const Toolbar = ({
  children,
  onClose,
}: {
  children?: ReactNode;
  onClose?: () => void;
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        height: '40px',
        backgroundColor: '#eeeeee',
        fontSize: '14px',
        paddingTop: '5px',
      }}
    >
      {children}
      <div
        style={{
          display: 'inline-block',
          flexGrow: '1',
        }}
      ></div>
      {onClose && (
        <div
          onClick={onClose}
          style={{
            display: 'inline-block',
            right: '40px',
            paddingRight: '20px',
            color: '#555555',
            fontSize: '30px',
          }}
        >
          <MdCancelPresentation />
        </div>
      )}
    </div>
  );
};
