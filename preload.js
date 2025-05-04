const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getDespesas: () => ipcRenderer.invoke('get-despesas'),
  addDespesa: (despesa) => ipcRenderer.invoke('add-despesa', despesa),
  removeDespesa: (id) => ipcRenderer.invoke('remove-despesa', id),
  updateDespesa: (despesa) => ipcRenderer.invoke('update-despesa', despesa),
  saveInfoExtra: (info) => ipcRenderer.invoke('save-info-extra', info),
  getInfoExtra: () => ipcRenderer.invoke('get-info-extra')

})
