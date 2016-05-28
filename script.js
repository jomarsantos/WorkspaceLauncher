document.getElementById("addPinnedTab").onclick = addPinnedTab;
document.getElementById("addRegularTab").onclick = addRegularTab;

document.getElementById("createNewWorkspace").onclick = createNewWorkspace;

var numPinnedTabs = 0;
var numRegularTabs = 0;
var workspaceList = [];

loadWorkspaces();

function loadWorkspaces() {
  chrome.storage.sync.get({workspaceList: []}, function(data) {
    workspaceList = data.workspaceList;

    var workspaces = document.getElementById("workspaces");
    for (var i = 0; i < workspaceList.length; i++) {
      var id = workspaceList[i].id;
      var workspaceBtn = document.createElement("button");
      workspaceBtn.id = id;
      workspaceBtn.onclick = function() {openWorkspace(this.id);}

      var workspaceNameText = workspaceList[i].name;
      var workspaceName = document.createTextNode(workspaceNameText);

      workspaceBtn.appendChild(workspaceName);
      workspaces.appendChild(workspaceBtn);
    }
  });
}


function addPinnedTab() {
  addTab(true, "pinnedTab", numPinnedTabs);
  numPinnedTabs++;
}

function addRegularTab() {
  addTab(false, "regularTab", numRegularTabs);
  numRegularTabs++;
}

function addTab(pinned, type, id) {
  var tabs = document.getElementById(type + "s");

  var container = document.createElement("div");
  container.className = "tabEntryContainer";

  var newTabInput = document.createElement("input");
  newTabInput.className = type;
  newTabInput.id = type + id;
  newTabInput.type = "text";
  newTabInput.name = "tab";

  var removeBtn = document.createElement("button");
  removeBtn.id = "removePinnedTab" + id;
  removeBtn.onclick = function() {this.parentNode.remove();}

  var removeText = document.createTextNode("Remove");

  var br = document.createElement("br");

  removeBtn.appendChild(removeText);
  container.appendChild(newTabInput);
  container.appendChild(removeBtn);
  container.appendChild(br);
  tabs.appendChild(container);
}

// Stores new workspace in Chrome Storage
function createNewWorkspace() {
  var workspaceTabs = [];

  var pinnedTabs = document.getElementsByClassName("pinnedTab");
  for (var i = 0; i < pinnedTabs.length; i++) {
    var tab = {
      url: pinnedTabs[i].value,
      pinned: true,
      active: false
    }
    workspaceTabs.push(tab);
  }
  var regularTabs = document.getElementsByClassName("regularTab");
  for (var i = 0; i < regularTabs.length; i++) {
    var tab = {
      url: regularTabs[i].value,
      pinned: false,
      active: false
    }
    workspaceTabs.push(tab);
  }

  do {
    var exists = false;
    var id = Math.floor(Math.random() * 100) + 1;
    for (var i = 0; i < workspaceList.length; i++) {
      if (workspaceList[i] == id) {
        exists = true;
        break;
      }
    }
  } while (exists);

  var key = "workspace" + id;
  var workspaceName = document.getElementById("workspaceName").value;

  workspaceListObj = {
    id: key,
    name: workspaceName
  }

  workspaceList.push(workspaceListObj);
  chrome.storage.sync.set({workspaceList: workspaceList});

  var newWorkspace = {
    id: key,
    name: workspaceName,
    tabs: workspaceTabs
  }

  var newWorkspaceObj = {};
  newWorkspaceObj[key] = newWorkspace;
  chrome.storage.sync.set(newWorkspaceObj);

  showNewWorkspace(key, workspaceName);
}

function showNewWorkspace(id, workspaceNameText) {
  var workspaceBtn = document.createElement("button");
  workspaceBtn.id = id;
  workspaceBtn.onclick = function() {openWorkspace(this.id);}

  var workspaceName = document.createTextNode(workspaceNameText);

  workspaceBtn.appendChild(workspaceName);
  workspaces.appendChild(workspaceBtn);
}

function openWorkspace(id) {
  var workspaceObj = {};
  workspaceObj[id] = [];
  chrome.storage.sync.get(workspaceObj, function(data) {
    var tabs = data[id].tabs;
    for (var i = 0; i < tabs.length; i++) {
      chrome.tabs.create(tabs[i]);
    }
  });
}
