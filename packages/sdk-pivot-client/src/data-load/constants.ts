// Message type for each of the data chunks
export const MessageType = {
  HEADERS: 'headers',
  METADATA: 'metadata',
  DATA: 'data',
  GRAND: 'grand',
  FINISH: 'finish',
  ERROR: 'error',
  TOTAL_ROWS: 'totalRows',
  DATA_FINISH: 'dataFinish',
  DATABARS: 'dataBars',
  RANGE_MIN_MAX: 'rangeMinMax',
};

export const MESSAGES_ORDER = [
  MessageType.ERROR,
  MessageType.HEADERS,
  MessageType.GRAND,
  MessageType.METADATA,
  MessageType.DATA,
  MessageType.DATA_FINISH,
  MessageType.TOTAL_ROWS,
  MessageType.DATABARS,
  MessageType.RANGE_MIN_MAX,
  MessageType.FINISH,
];
