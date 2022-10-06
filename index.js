const express = require('express')
const fileUpload = require("express-fileupload");
const path = require('path')
const fs = require('fs');
const app = express()

app.listen(8080);

app.set('view engine', 'ejs');
app.set('trust proxy', 'loopback')

app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(fileUpload({
	limits: { fileSize: 10 * 1024 * 1024 * 1024 },
}));

function customLog(...args) {
	date = new Date
	month = date.getMonth() + 1
	day = date.getDate().toString()
	day =  day.length > 1 ? day : '0' + day
	year = date.getFullYear()
	hour = date.getHours()
	minute = date.getMinutes().toString()
	minute = minute.length > 1 ? minute : '0' + minute
	second = date.getSeconds().toString()
	second = second.length > 1 ? second : '0' + second
	ampm = "AM"

	if (hour > 12) {
		hour = hour - 12
		ampm = "PM"
	}

	time = `[${month}/${day}/${year} - ${hour}:${minute}:${second} ${ampm}] `
	console.log(time + args)
}

function requestIP(req) {
	var ipDirty = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '')
	ipLessDirty = ipDirty.split(',')[0]
	ipLessDirtyArray = ipLessDirty.split(":")
	ipClean = ipLessDirtyArray[ipLessDirtyArray.length - 1]

	return ipClean
}

function validateSubpath(subpath) {
	if (subpath == "") {return ""}
	
	pathArray = subpath.split("/")

	filteredArray = pathArray.filter(function(value, index, arr){ 
		return value != ""
	});

	newSubpath = "/" + filteredArray.join("/")
	
	return newSubpath
}

function createSpeedTracker() {
	keys = Object.keys(speedTracker)

	if (keys.length == 0) {
		keyNumber =  1
	} else {
		oldKey = keys[keys.length-1]
		keyNumber = oldKey.charAt(oldKey.length-1) + 1
	}

	newKey = "x" + keyNumber

	speedTracker[newKey] = Date.now()

	return newKey
}

function removeSpeedTracker(key) {
	oldDate = speedTracker[key]
	nowDate = Date.now()

	timeTaken = nowDate - oldDate

	delete speedTracker.key

	return timeTaken
}

function logDownloadSuccess(key, filePath) {
	fileSize = fs.statSync(filePath).size
	timeTakenInSeconds = removeSpeedTracker(key)/1000

	if (timeTakenInSeconds > 0) {
		bps = fileSize / timeTakenInSeconds
		friendly = byteNumberToName(bps)
	} else {
		friendly = "Infinite GB"
	}

	customLog("File sent at " + friendly +"/s" + " - " + ip + " - " + fileName)
}

function byteNumberToName(bytes) {
	length = bytes.toString().split(".")[0].length

	if (length >= 10) {
		return (bytes/1000000000).toFixed(1) + "GB"
	} else if (length >= 7) {
		return (bytes/1000000).toFixed(1) + "MB"
	} else if (length >= 4) {
		return (bytes/1000).toFixed(1) + "KB"
	} else {
		return bytes + "B"
	}
}

subpath = validateSubpath("")

speedTracker = {}

app.get([subpath+"/admin"], async (req, res) => {
	data = fs.readdirSync("./files")

	for (x in data) {
		data[x] = data[x].trim()
	}

	res.render("admin", {
		data
	});
});

app.get([subpath+"/list"], async (req, res) => {
	data = fs.readdirSync("./files")

	for (x in data) {
		data[x] = data[x].trim()
	}

	res.render("list", {
		data
	});
});

app.get([subpath+"/resources/*"], async (req, res) => {
	urlArray = req.originalUrl.split("/")
	urlArray.splice(0,subpath.split("/").length+1)
	
	fileName = urlArray.join("/")

	var options = {
		root: path.join(__dirname)
	};
    
	res.sendFile(`./resources/${fileName}`, options)
});

app.get([subpath+"/download/*"], async (req, res) => {
	directViewFileTypes = ["png", "jpg", "jpeg"]

	urlArray = req.originalUrl.split("/")
	urlArray.splice(0, urlArray.length-1)
	
	fileName = decodeURI(urlArray.join("/"))
	fileExtension = fileName.split(".")[fileName.split(".").length-1].toLowerCase()

	ip = requestIP(req)

	customLog("Request Recieved - " + ip + " - " + fileName)
	key = createSpeedTracker()

	var options = {
		root: path.join(__dirname)
	};

	if (fs.existsSync(`./files/${fileName}`)) {
		if (directViewFileTypes.indexOf(fileExtension) > -1) {
			res.sendFile(`./files/${fileName}`, options, function (err) {
				if (err) {
					customLog("Download Cancelled - " + ip + " - " + fileName)
				} else {
					logDownloadSuccess(key, `./files/${fileName}`)
				}
			})
		} else {
			res.download(`./files/${fileName}`, options, function (err) {
				if (err) {
					customLog("Download Cancelled - " + ip + " - " + fileName)
				} else {
					logDownloadSuccess(key, `./files/${fileName}`)
				}
			})
		}
	} else {
		res.status(404)
		res.sendFile("./resources/404.html", options)
	}
});

app.post([subpath+"/renamefile"], async (req, res) => {
	oldFileName = req.body["oldFileName"]
	newFileName = req.body["newFileName"]

	fs.renameSync("./files/"+oldFileName,"files/"+newFileName)

	res.status(200)
	res.end()
});

app.post([subpath+"/deletefile"], async (req, res) => {
	fileName = req.body["fileName"]

	fs.unlink("./files/"+fileName, (err) => {
		if (err) throw err;
	})

	res.status(200)
	res.end()
});

app.post(["/uploadfile"], async (req, res) => {
	if (!req.files) {
		res.status(400).send("No file uploaded!")
		return
	}

	file = req.files.mainFile
	currentPath = __dirname + "/files/"
	
	file.mv(currentPath + file.name, (err) => {
		if (err) {
			return res.status(500).send(err)
		}
	})

	res.status(200)
	res.redirect("back")
})
