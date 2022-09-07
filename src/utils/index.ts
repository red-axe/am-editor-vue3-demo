export const getCurrentKey = () => {
  return localStorage.getItem("demo-key") || "default";
};

export const setCurrentKey = (key = "default") => {
  localStorage.setItem("demo-key", key);
};

export const setDocValue = (value: string, key: string = getCurrentKey()) => {
  localStorage.setItem(`${key}-demo-value`, value);
};

export const getDocValue = (key: string = getCurrentKey()) => {
  return localStorage.getItem(`${key}-demo-value`);
};
