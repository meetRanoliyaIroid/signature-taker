export const SIGNATURE_STATUS = Object.freeze({
  ACTIVE: 1,
  REVOKED: 2,
});

export const SIGNATURE_STATUS_LABEL = Object.freeze({
  [SIGNATURE_STATUS.ACTIVE]: "Active",
  [SIGNATURE_STATUS.REVOKED]: "Revoked",
});
