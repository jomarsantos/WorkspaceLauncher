var numPinnedTabs = 0;
var numRegularTabs = 0;
var workspaceList = [];

// Create New Workspace
document.getElementById("createNewWorkspace").onclick = createNewWorkspace;

// Add Pinned Tab Entry
document.getElementById("addPinnedTab").onclick = function() {
  addTab(true, "pinnedTab", numPinnedTabs);
  numPinnedTabs++;
};

// Add Regular Tab Entry
document.getElementById("addRegularTab").onclick = function() {
  addTab(false, "regularTab", numRegularTabs);
  numRegularTabs++;
};

// Add Tab Entry
function addTab(pinned, type, id) {
  var tabs = document.getElementById(type + "s");
  var container = document.createElement("div");
  var newTabInput = document.createElement("input");
  var removeBtn = document.createElement("button");
  var removeText = document.createTextNode("Remove");
  var br = document.createElement("br");

  newTabInput.className = type;
  newTabInput.id = type + id;
  newTabInput.type = "text";
  newTabInput.name = "tab";
  newTabInput.value = "http://";

  removeBtn.id = "removePinnedTab" + id;
  removeBtn.onclick = function() {
    this.parentNode.remove();
  }
  removeBtn.appendChild(removeText);

  container.className = "tabEntryContainer";
  container.appendChild(newTabInput);
  container.appendChild(removeBtn);
  container.appendChild(br);

  tabs.appendChild(container);
}

// Store New Workspace
function createNewWorkspace() {
  var workspaceTabs = [];
  var pinnedTabs = document.getElementsByClassName("pinnedTab");
  var regularTabs = document.getElementsByClassName("regularTab");
  var exists = false;
  var tab, i, id, key, workspaceName, newWorkspace, newWorkspaceObj;

  for (i = 0; i < pinnedTabs.length; i++) {
    tab = {
      url: pinnedTabs[i].value,
      pinned: true,
      active: false
    }
    workspaceTabs.push(tab);
  }

  for (i = 0; i < regularTabs.length; i++) {
    tab = {
      url: regularTabs[i].value,
      pinned: false,
      active: false
    }
    workspaceTabs.push(tab);
  }

  do {
    id = Math.floor(Math.random() * 100) + 1;
    for (i = 0; i < workspaceList.length; i++) {
      if (workspaceList[i] == id) {
        exists = true;
        break;
      }
    }
  } while (exists);

  key = "workspace" + id;
  workspaceName = document.getElementById("workspaceName").value;

  workspaceListObj = {
    id: key,
    name: workspaceName
  }

  workspaceList.push(workspaceListObj);
  chrome.storage.sync.set({workspaceList: workspaceList});

  newWorkspace = {
    id: key,
    name: workspaceName,
    tabs: workspaceTabs
  }

  newWorkspaceObj = {};
  newWorkspaceObj[key] = newWorkspace;
  chrome.storage.sync.set(newWorkspaceObj);

  showNewWorkspace(key, workspaceName);
}

// Add New Workspace to View
function showNewWorkspace(id, workspaceNameText) {
  var workspaceBtn = document.createElement("button");
  var workspaceName = document.createTextNode(workspaceNameText);

  workspaceBtn.id = id;
  workspaceBtn.onclick = function() {openWorkspace(this.id);}
  workspaceBtn.appendChild(workspaceName);

  workspaces.appendChild(workspaceBtn);
}

// Open Workspace Clicked
function openWorkspace(id) {
  var workspaceObj = {};
  var tabs, i;

  workspaceObj[id] = [];
  chrome.storage.sync.get(workspaceObj, function(data) {
    tabs = data[id].tabs;
    for (i = 0; i < tabs.length; i++) {
      chrome.tabs.create(tabs[i]);
    }
  });
}

// Load Workspaces on Startup
function loadWorkspaces() {
  var workspaces = document.getElementById("workspaces");
  var i, id, workspaceBtn, workspaceNameText, workspaceName;

  chrome.storage.sync.get({workspaceList: []}, function(data) {
    workspaceList = data.workspaceList;

    for (i = 0; i < workspaceList.length; i++) {
      id = workspaceList[i].id;
      workspaceNameText = workspaceList[i].name;
      workspaceName = document.createTextNode(workspaceNameText);

      workspaceBtn = document.createElement("button");
      workspaceBtn.id = id;
      workspaceBtn.onclick = function() {openWorkspace(this.id);}
      workspaceBtn.appendChild(workspaceName);
      workspaces.appendChild(workspaceBtn);
    }
  });
}

loadWorkspaces();
