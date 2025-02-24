export const savePlayerName = (name: string): void => {
  localStorage.setItem('skiPlayerName', name);
};

export const getPlayerName = (): string | null => {
  return localStorage.getItem('skiPlayerName');
};
