import { useEffect, useState } from 'react';
import {
  CellData,
  WaferMapGalleryConnected,
} from './semiconductor/WaferMapGallery';
import { DetailWaferMapPanel } from './DetailWaferMapPanel';
import { Toolbar } from './common/Toolbar';

export const PageWaferMaps = () => {
  const [currentCell, setCurrentCell] = useState<CellData | null>(null);

  useEffect(() => {
    if (currentCell) {
      setTimeout(
        () => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }),
        500,
      );
    }
  }, [currentCell]);

  return (
    <>
      <b>
        <h1>
          {'Flexibility will allow future advanced ComposeSDK capabilities'}
        </h1>
      </b>
      {currentCell ? (
        <>
          <Toolbar onClose={() => setCurrentCell(null)} />
          <DetailWaferMapPanel cellData={currentCell} />
        </>
      ) : (
        <div />
      )}
      <WaferMapGalleryConnected onClick={setCurrentCell} />
    </>
  );
};
