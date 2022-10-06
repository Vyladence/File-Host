function checkFalse(string) {
	if (string == "false" || string == "") {
		return false
	} else {
		return true
	}
}

function selectFile(div) {
	fileName = div.dataset.filename

	fileNameInputBox = document.getElementById("fileNameInputBox")
	fileNameInputBox.value = fileName
	fileNameInputBox.dataset.oldfilename = fileName
}

function clearFilenameBox () {
	fileNameInputBox = document.getElementById("fileNameInputBox")
	fileNameInputBox.value = ""
}

function copyLink () {
	filename = document.getElementById("fileNameInputBox").value
	pageURI = window.location.href
	fileHostURI = pageURI.split("admin")[0]

	if (fileHostURI.slice(-1) != "/") {
		fileHostURI += "/"
	}

	urlFileName = encodeURI(filename)

	copyString = fileHostURI + "download/" + urlFileName

    navigator.clipboard.writeText(copyString)
    //.then(alert.style.transform = "translate(0%)")
    //.then(setTimeout(() => { alert.style.transform = "translate(-104%)"; }, 2000));
}

function updateFilename() {
	fileName = document.getElementById('fileNameInputBox').value
	fileExtension = fileName.split(".")[fileName.split(".").length - 1]
	oldFileName = document.getElementById('fileNameInputBox').dataset.oldfilename || ""
	oldFileExtension = oldFileName.split(".")[oldFileName.split(".").length - 1]
	updateButton = document.getElementById("updateButton")

	if (fileName == "") {
		updateButton.textContent = "Select an item to update first dipshit"
		setTimeout(() => {updateButton.textContent = "Update File Name"}, 2000)
	} else {
		if (fileExtension == oldFileExtension) {
			runThatShit()
		} else {
			if (updateButton.textContent == "Are you sure? (Click to confirm)") {
				runThatShit()
			} else {
				updateButton.textContent = "Are you sure? (Click to confirm)"
			}
		}
	}

	async function runThatShit () {
		filename = document.getElementById("fileNameInputBox").value
		pageURI = window.location.href
		fileHostURI = pageURI.split("admin")[0]
		if (fileHostURI.slice(-1) != "/") {
			fileHostURI += "/"
		}

		data = {
			"oldFileName": oldFileName,
			"newFileName": fileName,
		}
	
		await fetch(fileHostURI + "renamefile", {
			method: 'POST',
			mode: 'cors',
			cache: 'no-cache',
			credentials: 'same-origin',
			redirect: 'follow',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(data)
		})
		.then(() => { location.reload() })
	}
}

function deleteFile() {
	fileName = document.getElementById('fileNameInputBox').value
	deleteButton = document.getElementById("deleteButton")

	if (fileName == "") {
		deleteButton.textContent = "Select an item to delete first dipshit"
		setTimeout(() => {deleteButton.textContent = "Delete this Item"}, 2000)
	} else {
		if (deleteButton.textContent == "Are you sure? (Click to confirm)") {
			runThatShit()
		} else {
			deleteButton.textContent = "Are you sure? (Click to confirm)"
		}
	}

	async function runThatShit () {
		filename = document.getElementById("fileNameInputBox").value
		pageURI = window.location.href
		fileHostURI = pageURI.split("admin")[0]
		if (fileHostURI.slice(-1) != "/") {
			fileHostURI += "/"
		}

		data = {
			"fileName": fileName,
		}
	
		await fetch(fileHostURI + "deletefile", {
			method: 'POST',
			mode: 'cors',
			cache: 'no-cache',
			credentials: 'same-origin',
			redirect: 'follow',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(data)
		})
		.then(() => { location.reload() })
	}
}

function changeText(file) {
	FileButton = document.getElementById("fileUploadButton")
	submitButton = document.getElementById("fuckinsenditbutton")
	console.log(file[0].name)

	if(file[0].size > 1.074e+10){
		alert("File is too big!");
	 } else {
		FileButton.getElementsByTagName("a")[0].textContent=file[0].name
		submitButton.disabled = false
	 }
}

function uploadingAnimation (button) {
	if (!button.disabled) {
		button.value = "Uploading"
		setTimeout(() => { button.value = "Uploading." }, 500)
		setTimeout(() => { button.value = "Uploading.." }, 1000)
		setTimeout(() => { button.value = "Uploading..." }, 1500)
		setTimeout(() => { uploadingAnimation(button) }, 2000)
	}
}

window.onload = () => {
	submitButton = document.getElementById("fuckinsenditbutton")	
	submitButton.disabled = true
	clearFilenameBox()
}
