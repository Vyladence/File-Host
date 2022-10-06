function downloadFile(div) {
	filename = div.dataset.filename

	pageURI = window.location.href
	fileHostURI = pageURI.split("list")[0]

	if (fileHostURI.slice(-1) != "/") {
		fileHostURI += "/"
	}

	urlFileName = encodeURI(filename)

	copyString = fileHostURI + "download/" + urlFileName

	//window.open(copyString, '_blank');
	fetchFile(copyString)
}

function fetchFile(url) {
    fetch(url).then(res => res.blob()).then(file => {
        let tempUrl = URL.createObjectURL(file);
        const aTag = document.createElement("a");
        aTag.href = tempUrl;
        aTag.download = url.replace(/^.*[\\\/]/, '');
        document.body.appendChild(aTag);
        aTag.click();
        URL.revokeObjectURL(tempUrl);
        aTag.remove();
    })
}