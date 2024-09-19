export const getSqlDate = (isoDateString) =>
  new Date(isoDateString).toISOString().slice(0, 19).replace('T', ' ')