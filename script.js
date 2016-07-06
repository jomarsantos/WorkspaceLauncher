var numPinnedTabs = 0;
var numRegularTabs = 0;
var workspaces = [];

/////////////////////////
// COMMON
/////////////////////////

// Hide New Workspace Dialogue On Mouse Click Elsewhere
document.addEventListener('mouseup', function (e) {
  var sidebar = document.getElementById("sidebar");
  var exitButton = document.getElementById("closeSidebar");
  var addButton = document.getElementById("addWorkspaceButton")
  if (( !sidebar.contains(e.target) || e.target == exitButton) &&
      e.target != addButton) {
    if (getComputedStyle(sidebar).display == "block") {
      toggleSidebar();
    }
  }
}.bind(this));

// Toggle Sidebar
function toggleSidebar() {
  $("#sidebar").animate({width:'toggle'},350);
}

/////////////////////////
// TAB ENTRY
/////////////////////////

// Add Pinned Tab Entry
document.getElementById("addPinnedTab").onclick = function() {
  numPinnedTabs++;
  addTab("pinnedTab");
};

// Add Regular Tab Entry
document.getElementById("addRegularTab").onclick = function() {
  numRegularTabs++;
  addTab("regularTab");
};

// Add Tab Entry
function addTab(type) {
  var tabs = document.getElementById(type + "s");
  var tab = document.querySelector("#tabTemplate");
  var clone = document.importNode(tab.content, true);
  var input = clone.querySelector("input");
  var removeTab = clone.querySelector("button");

  input.className = type;
  removeTab.onclick = function() {
    this.parentNode.remove();
  }
  tabs.appendChild(clone);
}

/////////////////////////
// WORKSPACES
/////////////////////////

// Create New Workspace
document.getElementById("saveWorkspace").onclick = function() {
  var workspaceTabs = [];
  var pinnedTabs = document.getElementsByClassName("pinnedTab");
  var regularTabs = document.getElementsByClassName("regularTab");
  var workspacesDiv = document.getElementById("workspaces");
  var tab, i, workspaceName, newWorkspace, workspace;

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

  workspaces.unshift(newWorkspace);
  chrome.storage.sync.set({workspaces: workspaces});

  showNewWorkspace(workspaceName);
  toggleSidebar();
  resetWorkspaceForm();
  $('#workspaces').animate({scrollLeft: 0}, 400);
}

// Add New Workspace to View
function showNewWorkspace(workspaceName) {
  var workspacesDiv = document.getElementById("workspaces");
  var firstWorkspace = document.getElementsByClassName("workspace")[0];
  var workspace = createWorkspaceButton(workspaceName);
  workspacesDiv.insertBefore(workspace, firstWorkspace);
}


// Load Workspaces on Startup
function loadWorkspaces() {
  var workspacesDiv = document.getElementById("workspaces");
  var i, clone, workspace;

  chrome.storage.sync.get({workspaces: []}, function(data) {
    workspaces = data.workspaces;

    for (i = 0; i < workspaces.length; i++) {
      workspace = createWorkspaceButton(workspaces[i].name);
      workspacesDiv.appendChild(workspace);
    }
  });
}

// Returns the Button of a Workspace
function createWorkspaceButton(workspaceName) {
  var workspacesDiv = document.getElementById("workspaces");
  var workspaceTemplate = document.querySelector("#workspaceTemplate");
  var workspace = document.importNode(workspaceTemplate.content, true).querySelector("button");
  var workspaceNameText;

  workspace.onclick = function() {
    openWorkspace(workspaceName);
  }

  workspace.id = str = workspaceName.replace(/\s+/g, '-').toLowerCase();
  workspaceNameText = workspaceName.toUpperCase();
  workspace.querySelector("p").innerHTML = workspaceNameText;
  return workspace;
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

// Returns Workspace of Given Name
function getWorkspace(workspaceName) {
  for (i = 0; i < workspaces.length; i++) {
    if (workspaces[i].name == workspaceName) {
      return workspaces[i];
    }
  }
}

// Resets Workspace Form to Default View
function resetWorkspaceForm() {
  numRegularTabs = 0;
  numPinnedTabs = 0;
  var tabs = document.getElementsByClassName('tab');
  while(tabs[0]) {
    tabs[0].parentNode.removeChild(tabs[0]);
  }
  addTab("regularTab");
  var nameInput = document.getElementById('workspaceName');
  nameInput.value = "";
}

// Handle Clicking of Add Workspace Button
document.getElementById("addWorkspaceButton").onclick = function() {
  // TODO: ensure workspace form is in sidebar
  toggleSidebar();
}

// Handle Left Scrolling of Workspaces
$("#workspaceArrowLeft").click(function(){
  var workspacesContainer = document.getElementById("workspaces");
  var containerWidth = workspacesContainer.offsetWidth;
  var diff = workspacesContainer.scrollLeft % 160;

  if (workspacesContainer.scrollLeft > 0) {
    if (diff ==  0) {
      $('#workspaces').animate({scrollLeft: workspacesContainer.scrollLeft -
        containerWidth}, 400);
    } else {
      $('#workspaces').animate({scrollLeft: workspacesContainer.scrollLeft -
        diff - containerWidth + 160}, 400);
    }
    return false;
  }
});

// Handle Right Scrolling of Workspaces
$("#workspaceArrowRight").click(function(){
  var workspacesContainer = document.getElementById("workspaces");
  var containerWidth = workspacesContainer.offsetWidth;

  if (workspacesContainer.scrollLeft < (workspaces.length - 4) * 160) {
    var diff = 160 - workspacesContainer.scrollLeft % 160;
    var workspacesContainer = document.getElementById("workspaces");
    $('#workspaces').animate({scrollLeft: workspacesContainer.scrollLeft +
      diff + containerWidth - 160}, 400);
    return false;
  }
});

// Hide Websites View
function hideWebsitesView() {
  var websitesContainer = $("#websitesContainer");
  websitesContainer.fadeOut(400);
}

// Show Websites View
function showWebsitesView() {
  var websitesContainer = $("#websitesContainer");
  websitesContainer.fadeIn(400);
}

// Show All Workspace View
document.getElementById("showAllWorkspaces").onclick = function() {
  var workspaces = document.getElementById("workspaces");

  workspaces.style.width = "105%";
  workspaces.style.overflowX = "hidden";
  workspaces.style.overflowY = "scroll";
  workspaces.style.whiteSpace = "normal";
  workspaces.style.height = "80%";
  hideWebsitesView();
  $("#workspacesContainer").animate({
    height: "100%"}, 1000);
  $("#showAllWorkspaces").hide();
  $("#workspacesBackButton").show();
  $("#workspaceArrowLeft").fadeOut();
  $("#workspaceArrowRight").fadeOut();
}

// Hide All Workspace View
document.getElementById("workspacesBackButton").onclick = function() {
  var workspacesContainer = $("#workspacesContainer")
  var main = document.getElementById("main");
  var workspaces = document.getElementById("workspaces");

  workspaces.style.width = "auto";
  workspaces.style.overflowX = "scroll";
  workspaces.style.overflowY = "hidden";
  workspacesContainer.animate({
    height: "210px"}, 1000);
  $("#workspacesBackButton").hide(200);
  $("#showAllWorkspaces").show(200);
  $("#workspaceArrowLeft").fadeIn();
  $("#workspaceArrowRight").fadeIn();
  setTimeout(showWebsitesView, 1000);
  setTimeout(setDefaultWorkspaceDiv, 1000);
}

// Helper for Correct Timing of Back Button
function setDefaultWorkspaceDiv() {
  var workspaces = document.getElementById("workspaces");

  workspaces.style.height = "auto";
  workspaces.style.whiteSpace = "nowrap";
}

/////////////////////////
// INITIALIZE
/////////////////////////

addTab("regularTab");
loadWorkspaces();
