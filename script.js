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

  workspace.id = workspaceName;
  workspaceNameText = workspaceName.toUpperCase();
  workspace.querySelector("h3").innerHTML = workspaceNameText;
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

/////////////////////////
// INITIALIZE
/////////////////////////

addTab("regularTab");
loadWorkspaces();






















































$("#workspaceArrowLeft").click(function(){
  var workspacesContainer = document.getElementById("workspaces");
  if (workspacesContainer.scrollLeft > 0) {
    var diff = workspacesContainer.scrollLeft % 160;
    $('#workspaces').animate({scrollLeft: workspacesContainer.scrollLeft - diff - 480}, 400);
    return false;
  }
});

$("#workspaceArrowRight").click(function(){
  var workspacesContainer = document.getElementById("workspaces");
  if (workspacesContainer.scrollLeft < (workspaces.length - 4) * 160) {
    var diff = workspacesContainer.scrollLeft % 160;
    var workspacesContainer = document.getElementById("workspaces");
    $('#workspaces').animate({scrollLeft: workspacesContainer.scrollLeft - diff + 640}, 400);
    return false;
  }
});


// // Left Scroll
// document.getElementById("directionArrowWorkspaceLeft").onclick = function() {
//   var workspacesContainer = document.getElementById("workspaces");
//   var workspace = document.getElementsByClassName("workspace");
//   var diff = workspacesContainer.scrollLeft % 170;
//   workspacesContainer.scrollLeft = workspacesContainer.scrollLeft - diff - 510;
// }
//
// // Right Scroll
// document.getElementById("directionArrowWorkspaceRight").onclick = function() {
//   var workspacesContainer = document.getElementById("workspaces");
//   var workspace = document.getElementsByClassName("workspace");
//   workspacesContainer.scrollLeft = workspacesContainer.scrollLeft + 680;
// }

// // Toggle All Workspace View
// document.getElementById("showAll").onclick = function() {
//   var workspaces = document.getElementById("workspaces");
//   var workspacesContainer = document.getElementById("workspacesContainer");
//   var leftArrow = document.getElementById("directionArrowWorkspaceLeft");
//   var rightArrow = document.getElementById("directionArrowWorkspaceRight");
//   var backButton = document.getElementById("backButton");
//   var showAllButton = document.getElementById("showAll");
//
//
//   if (workspaces.style.height == 'auto') {
//     workspaces.style.height = '150px';
//     workspaces.style.overflow = 'scroll';
//     workspaces.style.overflowY = 'hidden';
//     workspaces.style.whiteSpace = 'nowrap';
//     workspacesContainer.style.overflow = 'hidden';
//     workspacesContainer.style.marginBottom = "0px";
//     leftArrow.style.display = 'inline-block';
//     rightArrow.style.display = 'inline-block';
//     backButton.style.display = 'none';
//     showAllButton.style.display = 'inline';
//   } else {
//     workspaces.style.height = 'auto';
//     workspaces.style.overflow = 'visible';
//     workspaces.style.overflowY = 'visible';
//     workspaces.style.whiteSpace = 'normal';
//     workspacesContainer.style.overflow = 'visible';
//     workspaces.style.marginBottom = "80px";
//     leftArrow.style.display = 'none';
//     rightArrow.style.display = 'none';
//     backButton.style.display = 'inline';
//     showAllButton.style.display = 'none';
//   }
// }
//
// // Toggle All Workspace View
// document.getElementById("backButton").onclick = function() {
//   var workspaces = document.getElementById("workspaces");
//   var workspacesContainer = document.getElementById("workspacesContainer");
//   var leftArrow = document.getElementById("directionArrowWorkspaceLeft");
//   var rightArrow = document.getElementById("directionArrowWorkspaceRight");
//   var backButton = document.getElementById("backButton");
//   var showAllButton = document.getElementById("showAll");
//
//   workspaces.style.height = '150px';
//   workspaces.style.overflow = 'scroll';
//   workspaces.style.overflowY = 'hidden';
//   workspaces.style.whiteSpace = 'nowrap';
//   workspacesContainer.style.overflow = 'hidden';
//   leftArrow.style.display = 'inline-block';
//   rightArrow.style.display = 'inline-block';
//   backButton.style.display = 'none';
//   showAllButton.style.display = 'inline';
// }
