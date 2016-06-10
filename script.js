var numPinnedTabs = 0;
var numRegularTabs = 0;
var workspaces = [];

// Toggle New Workspace Dialogue
document.getElementById("addButton").onclick = function() {
  var container = document.getElementById("newWorkspaceContainer");

  if (container.style.width == '300px') {
    container.style.width = '0px';
  } else {
    container.style.width = '300px';
  }
}

// Hide New Workspace Dialogue on X Click
document.getElementById("closeDialogue").onclick = closeDialogue();

// Hide New Workspace Dialogue On Mouse Click Elsewhere
document.addEventListener('mouseup', function (e) {
  var container = document.getElementById("newWorkspaceContainer");
  var exitButton = document.getElementById("closeDialogue");

  if (!container.contains(e.target) || e.target == exitButton) {
    closeDialogue();
  }
}.bind(this));

function closeDialogue() {
  var container = document.getElementById("newWorkspaceContainer");
  container.style.width = '0px';
}


// Create New Workspace
document.getElementById("createNewWorkspace").onclick = function() {
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

  workspaceName = document.getElementById("workspaceName").value;

  newWorkspace = {
    name: workspaceName,
    tabs: workspaceTabs
  }

  workspaces.push(newWorkspace);
  chrome.storage.sync.set({workspaces: workspaces});

  showNewWorkspace(workspaceName);
}

// Add Pinned Tab Entry
document.getElementById("addPinnedTab").onclick = function() {
  addTab(true, "pinnedTab", numPinnedTabs++);
};

// Add Regular Tab Entry
document.getElementById("addRegularTab").onclick = function() {
  addTab(false, "regularTab", numRegularTabs++);
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

// Add New Workspace to View
function showNewWorkspace(workspaceNameText) {
  var workspacesDiv = document.getElementById("workspaces");
  var workspaceBtn = document.createElement("button");
  var workspaceName = document.createTextNode(workspaceNameText);

  workspaceBtn.id = workspaceNameText;
  workspaceBtn.onclick = function() {
    openWorkspace(workspaceNameText);
  }
  workspaceBtn.appendChild(workspaceName);
  workspacesDiv.appendChild(workspaceBtn);
}

// Open Workspace Clicked
function openWorkspace(workspaceName) {
  var i;
  var tabs = [];
  var workspace = {};

  workspace = getWorkspace(workspaceName);
  tabs = workspace.tabs;

  for (i = 0; i < tabs.length; i++) {
    chrome.tabs.create(tabs[i]);
  }
}

// Returns workspace of given name
function getWorkspace(workspaceName) {
  for (i = 0; i < workspaces.length; i++) {
    if (workspaces[i].name == workspaceName) {
      return workspaces[i];
    }
  }
}

// Load Workspaces on Startup
function loadWorkspaces() {
  var workspacesDiv = document.getElementById("workspaces");
  var i, workspaceBtn, workspaceNameText, workspaceName;

  chrome.storage.sync.get({workspaces: []}, function(data) {
    workspaces = data.workspaces;

    for (i = 0; i < workspaces.length; i++) {
      workspaceNameText = workspaces[i].name;
      workspaceName = document.createTextNode(workspaceNameText);

      workspaceBtn = document.createElement("button");
      workspaceBtn.id = workspaceNameText;
      workspaceBtn.onclick = function() {
        openWorkspace(workspaceNameText);
      }
      workspaceBtn.appendChild(workspaceName);
      workspacesDiv.appendChild(workspaceBtn);
    }
  });
}

loadWorkspaces();
