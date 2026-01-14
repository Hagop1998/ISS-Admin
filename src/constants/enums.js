/**
 * Authentication Code Type Enum
 * Represents different time periods for authentication codes
 */
export const AuthCodeTypeEnum = {
  ONE_HOUR: 1,
  EIGHT_HOURS: 2,
  TWENTY_FOUR_HOURS: 3,
};

/**
 * QR Code Type Enum
 * Represents the validity type of QR codes
 */
export const QrCodeTypeEnum = {
  VALID_ONCE: 0,
  VALID_PERIOD: 1,
};

/**
 * QR Validity Time Enum
 * Represents different time periods for QR code validity (in hours)
 */
export const QrValidityTimeEnum = {
  oneHour: 1,
  fourHours: 4,
  eightHours: 8,
  twelveHours: 12,
  oneDay: 24,
  threeDays: 72,
  oneWeek: 168,
  twoWeeks: 336,
  oneMonth: 720,
};

/**
 * Elevator Call Type Enum
 * Represents different types of elevator calls
 */
export const ElevatorCallTypeEnum = {
  VISITOR_CALL: 0,
  RESIDENT_PRE_CALL: 1,
};

/**
 * Chip Card Operation Enum
 * Represents different operations for chip cards
 */
export const ChipCardOperationEnum = {
  ADD: 1,
  DELETE: 2,
  CLEAR: 3,
};

/**
 * Door Initialization Type Enum
 * Represents different types of door initialization operations
 */
export const DoorInitTypeEnum = {
  RESTORE_FACTORY: 1,
  CLEAR_FACE_DATA: 2,
};

/**
 * Set Door Type Enum
 * Represents different door configuration settings
 */
export const SetDoorTypeEnum = {
  LIVENESS_SWITCH: 1,
  LIVENESS_THRESHOLD: 2,
  FACE_RECOGNITION_THRESHOLD: 3,
  CLOUD_INTERCOM_SWITCH: 5,
  QR_CODE_SWITCH: 6,
  AUTOMATIC_FACE_SWITCH: 7,
  CARD_SWIPE_FAILURE_VERIFICATION: 9,
  DIRECT_CALL_MOBILE: 13,
  UPLOAD_UNLOCK_RECORD_IMAGE: 16,
  ADVERTISING_SLEEP_START: 21,
  ADVERTISING_SLEEP_END: 22,
};

/**
 * Push Notice Type Enum
 * Represents different types of push notifications
 */
export const PushNoticeTypeEnum = {
  UPDATE_ADS: 1,
  UPLOAD_FACE_DB: 2,
};

/**
 * Middleware Notify Type Enum
 * Represents different types of middleware notifications
 */
export const MiddlewareNotifyTypeEnum = {
  ONLINE: 'online',
  UNLOCK_INFO: 'unlockInfo',
  VERIFICATION_QR_CODE: 'verificationQrCode',
  REG_SIP: 'regSip',
  FACE_REG: 'faceReg',
  CALLBACK: 'callback',
  GET_FACE_INFO: 'getFaceInfo',
};

/**
 * Unlock Type Enum
 * Represents different methods of door unlocking
 */
export const UnlockTypeEnum = {
  IC: 1,
  PASSWORD: 2,
  AUTH_CODE: 3,
  BLUETOOTH: 4,
  ID: 7,
  QR: 10,
  FACE: 12,
  CPU_CARD: 13,
};

// Helper functions to get enum values by key or find key by value
export const getUnlockTypeName = (value) => {
  const entries = Object.entries(UnlockTypeEnum);
  const found = entries.find(([_, val]) => val === value);
  return found ? found[0] : 'UNKNOWN';
};

export const getAuthCodeTypeName = (value) => {
  const entries = Object.entries(AuthCodeTypeEnum);
  const found = entries.find(([_, val]) => val === value);
  return found ? found[0] : 'UNKNOWN';
};

export const getQrCodeTypeName = (value) => {
  const entries = Object.entries(QrCodeTypeEnum);
  const found = entries.find(([_, val]) => val === value);
  return found ? found[0] : 'UNKNOWN';
};
