/*
IPC events:
- REPLUGGED_GET_THEME_CSS: returns compiled CSS for a theme by name
- REPLUGGED_LIST_THEMES: returns an array of all valid themes available
- REPLUGGED_UNINSTALL_THEME: uninstalls a theme by name
*/

const { ipcMain } = require("electron");

ipcMain.handle("REPLUGGED_GET_THEME_CSS", async (event, themeName) => {

});

ipcMain.handle("REPLUGGED_LIST_THEMES", async () => {});

ipcMain.handle("REPLUGGED_UNINSTALL_THEME", async (event, themeName) => {});