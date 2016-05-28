document.getElementById("addPinnedUrl").addEventListener("click", addPinnedUrl);
document.getElementById("addRegularUrl").addEventListener("click", addRegularUrl);
document.getElementById("createNewWorkspace").addEventListener("click", createNewWorkspace);

function addPinnedUrl() {
  var urls = document.getElementById("pinnedUrls");
  var newUrlInput = document.createElement("input");
  newUrlInput.className = "pinnedUrl";
  newUrlInput.type = "text";
  newUrlInput.name = "url";
  urls.appendChild(newUrlInput);
  var br = document.createElement("br");
  urls.appendChild(br);
}

function addRegularUrl() {
  var urls = document.getElementById("regularUrls");
  var newUrlInput = document.createElement("input");
  newUrlInput.className = "regularUrl";
  newUrlInput.type = "text";
  newUrlInput.name = "url";
  urls.appendChild(newUrlInput);
  var br = document.createElement("br");
  urls.appendChild(br);
}

function createNewWorkspace() {
  var urls = document.getElementsByClassName("pinnedUrl");
  for (var i = 0; i < urls.length; i++) {
    console.log(urls[i]);
    var url = urls[i].value;
    var tab = {
      url: url,
      pinned: true,
      active: false
    }
    chrome.tabs.create(tab);
  }

  var urls = document.getElementsByClassName("regularUrl");
  for (var i = 0; i < urls.length; i++) {
    console.log(urls[i]);
    var url = urls[i].value;
    var tab = {
      url: url,
      active: false
    }
    chrome.tabs.create(tab);
  }
}
