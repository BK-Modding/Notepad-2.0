const path = require('path');
const fs = require('fs');

const { dialog } = require('electron');

const nameFromPath = (filepath) => {
    // const nameWithExt = path.basename(filepath);
    // const ext = path.extname(filepath);
    // const filename = path.basename(nameWithExt, ext);
    // return filename;

    return path.basename(filepath, path.extname(filepath))
}

const saveFile = (currentWindow, savedPath) => {
    currentWindow.webContents.executeJavaScript('document.getElementById("editor").value', true).then(textData => {
        fs.writeFile(savedPath, textData, (err) => {
            if (err) throw err;

            console.log("Saved!");
            currentWindow.webContents.send("file:saved", savedPath);
        });
    });
}

const saveAsDialog = (currentWindow, previouslySavedPath) => {
    dialog.showSaveDialog(currentWindow, {
        title: 'Save As',
        defaultPath: previouslySavedPath ?? path.resolve(process.env.HOMEPATH, '*.txt'),
        buttonLabel: 'Save',
        filters: [
            { name: 'Text Documents (*.txt)', extensions: ['txt'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    }).then(file => {
        if (!file.canceled) {
            saveFile(currentWindow, file.filePath.toString());
        }
    }).catch(err => {
        console.log(err);
    });
}

const saveFileHandler = (currentWindow, saveAsFlag) => {
    currentWindow.webContents.executeJavaScript('sessionStorage.getItem("filepath")', true).then(filepath => {
        if (filepath) { // file loaded
            if (saveAsFlag) {
                saveAsDialog(currentWindow, filepath);
            } else {
                saveFile(currentWindow, filepath);
            }
        } else {
            saveAsDialog(currentWindow);
        }
    });
}

const openFile = (currentWindow, openPath) => {
    fs.readFile(openPath, 'utf8', (err, content) => {
        if (err) throw err;

        console.log("Opened!");
        currentWindow.webContents.send('file:open', openPath, content);
    });
}

const openFileDialog = (currentWindow, previouslySavedPath) => {
    dialog.showOpenDialog(currentWindow, {
        title: 'Open',
        defaultPath: previouslySavedPath ?? path.resolve(process.env.HOMEPATH, '*.txt'),
        buttonLabel: 'Open',
        filters: [
            { name: 'Text Documents (*.txt)', extensions: ['txt'] },
            { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
    }).then(files => {
        if (!files.canceled) {
            openFile(currentWindow, files.filePaths[0]);
        }
    }).catch(err => {
        console.log(err);
    });
}

const openFileHandler = (currentWindow) => {
    currentWindow.webContents.executeJavaScript('sessionStorage.getItem("filepath")', true).then(filepath => {
        if (filepath) {
            openFileDialog(currentWindow, filepath)
        } else {
            openFileDialog(currentWindow);
        }
    });
}

module.exports = {
    saveFileHandler,
    openFileHandler,
    nameFromPath
}