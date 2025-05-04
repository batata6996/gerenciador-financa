const { app, BrowserWindow, ipcMain } = require('electron')
const fs = require('fs')
const path = require('path')

const arquivoDados = path.join(__dirname, 'dados_despesas.json')

// Criar arquivo se não existir
if (!fs.existsSync(arquivoDados)) {
  fs.writeFileSync(arquivoDados, '[]', 'utf-8')
}

const arquivoInfoExtra = path.join(__dirname, 'info_extra.json')

if (!fs.existsSync(arquivoInfoExtra)) fs.writeFileSync(arquivoInfoExtra, JSON.stringify({ rendaMensal: 0, rendasExtras: [] }))


let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false
    }
  })

  mainWindow.loadFile('src/index.html')
}

// Manipuladores de IPC para operações de arquivo

ipcMain.handle('get-despesas', () => {
  try {
    const data = fs.readFileSync(arquivoDados, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
})

ipcMain.handle('save-info-extra', (event, info) => {
  fs.writeFileSync(arquivoInfoExtra, JSON.stringify(info, null, 2))
})

ipcMain.handle('get-info-extra', () => {
  try {
    return JSON.parse(fs.readFileSync(arquivoInfoExtra, 'utf-8'))
  } catch {
    return { rendaMensal: 0, rendasExtras: [] }
  }
})


ipcMain.handle('add-despesa', (event, despesa) => {
  const despesas = JSON.parse(fs.readFileSync(arquivoDados, 'utf-8'))
  despesas.push(despesa)
  fs.writeFileSync(arquivoDados, JSON.stringify(despesas, null, 2))
})

ipcMain.handle('remove-despesa', (event, id) => {
  const despesas = JSON.parse(fs.readFileSync(arquivoDados, 'utf-8'))
  const novas = despesas.filter(d => d.id !== id)
  fs.writeFileSync(arquivoDados, JSON.stringify(novas, null, 2))
})

ipcMain.handle('update-despesa', (event, despesaAtualizada) => {
  const despesas = JSON.parse(fs.readFileSync(arquivoDados, 'utf-8'))
  const index = despesas.findIndex(d => d.id === despesaAtualizada.id)
  if (index !== -1) {
    despesas[index] = despesaAtualizada
    fs.writeFileSync(arquivoDados, JSON.stringify(despesas, null, 2))
  }
})


ipcMain.handle('save-despesas', (event, despesas) => {
  fs.writeFileSync(arquivoDados, JSON.stringify(despesas, null, 2))
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})