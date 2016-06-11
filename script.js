var numPinnedTabs = 0;
var numRegularTabs = 0;
var workspaces = [];

// Left Scroll
document.getElementById("directionArrowWorkspaceLeft").onclick = function() {
  var workspacesContainer = document.getElementById("workspaces");
  var workspace = document.getElementsByClassName("workspace");
  var diff = workspacesContainer.scrollLeft % 170;
  workspacesContainer.scrollLeft = workspacesContainer.scrollLeft - diff - 510;
}

// Right Scroll
document.getElementById("directionArrowWorkspaceRight").onclick = function() {
  var workspacesContainer = document.getElementById("workspaces");
  var workspace = document.getElementsByClassName("workspace");
  workspacesContainer.scrollLeft = workspacesContainer.scrollLeft + 680;
}

// Toggle All Workspace View
document.getElementById("workspacesTitle").onclick = function() {
  var workspaces = document.getElementById("workspaces");
  var workspacesContainer = document.getElementById("workspacesContainer");
  var leftArrow = document.getElementById("directionArrowWorkspaceLeft");
  var rightArrow = document.getElementById("directionArrowWorkspaceRight");
  var backButton = document.getElementById("backButton");

  if (workspaces.style.height == 'auto') {
    workspaces.style.height = '150px';
    workspaces.style.overflow = 'scroll';
    workspaces.style.overflowY = 'hidden';
    workspaces.style.whiteSpace = 'nowrap';
    workspacesContainer.style.overflow = 'hidden';
    workspacesContainer.style.marginBottom = "0px";
    leftArrow.style.display = 'inline-block';
    rightArrow.style.display = 'inline-block';
    backButton.style.display = 'none';
  } else {
    workspaces.style.height = 'auto';
    workspaces.style.overflow = 'visible';
    workspaces.style.overflowY = 'visible';
    workspaces.style.whiteSpace = 'normal';
    workspacesContainer.style.overflow = 'visible';
    workspaces.style.marginBottom = "80px";
    leftArrow.style.display = 'none';
    rightArrow.style.display = 'none';
    backButton.style.display = 'inline';
  }
}

// Toggle All Workspace View
document.getElementById("backButton").onclick = function() {
  var workspaces = document.getElementById("workspaces");
  var workspacesContainer = document.getElementById("workspacesContainer");
  var leftArrow = document.getElementById("directionArrowWorkspaceLeft");
  var rightArrow = document.getElementById("directionArrowWorkspaceRight");
  var backButton = document.getElementById("backButton");

  workspaces.style.height = '150px';
  workspaces.style.overflow = 'scroll';
  workspaces.style.overflowY = 'hidden';
  workspaces.style.whiteSpace = 'nowrap';
  workspacesContainer.style.overflow = 'hidden';
  leftArrow.style.display = 'inline-block';
  rightArrow.style.display = 'inline-block';
  backButton.style.display = 'none';
}

// Toggle New Workspace Dialogue
document.getElementById("addButton").onclick = function() {
  var container = document.getElementById("newWorkspaceContainer");
  var addButton = document.getElementById("addButton");

  if (container.style.width == '300px') {
    container.style.width = '0px';
  } else {
    addButton.style.display = 'none';
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
  addButton.style.display = 'block';
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
  resetForm();
  closeDialogue();
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
  var removeText = document.createTextNode("x");
  var br = document.createElement("br");

  newTabInput.className = type;
  newTabInput.id = type + id;
  newTabInput.type = "text";
  newTabInput.name = "tab";
  newTabInput.value = "http://";

  removeBtn.id = "removePinnedTab" + id;
  removeBtn.className = "removeTabBtn";
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
  var workspaceName = document.createElement("h3");
  workspaceName.className = "workspaceName";
  workspaceName.innerHTML = workspaceNameText.toUpperCase();

  workspaceBtn = document.createElement("button");
  workspaceBtn.className = 'workspace';
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
      var workspaceName = document.createElement("h3");
      workspaceName.className = "workspaceName";
      workspaceName.innerHTML = workspaceNameText.toUpperCase();

      workspaceBtn = document.createElement("button");
      workspaceBtn.className = 'workspace';
      workspaceBtn.id = workspaceNameText;
      workspaceBtn.onclick = function() {
        openWorkspace(workspaceNameText);
      }
      workspaceBtn.appendChild(workspaceName);
      workspacesDiv.appendChild(workspaceBtn);
    }
  });
}

function resetForm() {
  numRegularTabs = 0;
  numPinnedTabs = 0;
  var tabs = document.getElementsByClassName('tabEntryContainer');
  while(tabs[0]) {
    tabs[0].parentNode.removeChild(tabs[0]);
  }
  addTab(false, "regularTab", numRegularTabs++);
  var nameInput = document.getElementById('workspaceName');
  nameInput.value = "";
}

addTab(false, "regularTab", numRegularTabs++);
loadWorkspaces();
