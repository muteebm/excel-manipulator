const {app, BrowserWindow} = require('electron');  
const url = require('url');
const path = require('path');   
	
function onReady () {     
    var win;
	win = new BrowserWindow({})    
	win.loadURL(url.format({      
		pathname: path.join(
			__dirname,
			'dist/excel-manipulator/index.html'),       
		protocol: 'file:',      
		slashes: true     
	}))   
} 

app.on('ready', onReady);
    