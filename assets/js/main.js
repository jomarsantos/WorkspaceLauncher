var numPinnedTabs = 0;
var numRegularTabs = 0;
var workspaces = {};

/////////////////////////
// COMMON
/////////////////////////

// Hide New Workspace Dialogue On Mouse Click Elsewhere
document.addEventListener('mouseup', function (e) {
  var sidebar = document.getElementById("sidebar");
  var exitButton = document.getElementById("closeSidebar");
  var addButton = document.getElementById("addWorkspaceButton");
  var backButton = document.getElementById("workspacesBackButton");
  var showAllButton = document.getElementById("showAllWorkspaces");
  if (( !sidebar.contains(e.target) || e.target == exitButton) &&
      (e.target != addButton && e.target != backButton && e.target != showAllButton)) {
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
  var errorMsg = document.getElementById("workspaceError");
  var successMsg = document.getElementById("workspaceSuccess");
  var tab, i, workspaceName, id, newWorkspace, workspace;

  errorMsg.innerHTML = "";
  workspaceName = document.getElementById("workspaceName").value;
  id = workspaceName.replace(/\s+/g, '-').toLowerCase();

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

  newWorkspace = {
    name: workspaceName,
    tabs: workspaceTabs
  }

  if (workspaceName == "") {
    errorMsg.innerHTML = "Oops! You forgot to name your workspace.<br>Be creative!";
    return;
  }
  workspaces[id] = newWorkspace;
  chrome.storage.sync.set({workspaces: workspaces});
  showNewWorkspace(workspaceName, id);

  successMsg = document.getElementById("workspaceSuccess");
  successMsg.innerHTML = "Workspace created!";
  setTimeout(success, 1700);
}

// Delay for Successful Creation
function success(workspaceName) {
  toggleSidebar();
  resetWorkspaceForm();
}


// Add New Workspace to View
function showNewWorkspace(workspaceName, id) {
  var workspacesDiv = document.getElementById("workspaces");
  var firstWorkspace = document.getElementsByClassName("workspaceItem")[0];
  var workspace = createWorkspaceButton(workspaceName, id);
  workspacesDiv.insertBefore(workspace, firstWorkspace);
	$('#workspaces').animate({scrollLeft: 0}, 400);
}


// Load Workspaces on Startup
function initializeWorkspaces() {
  chrome.storage.sync.get({workspaces: {}}, function(data) {
    workspaces = data.workspaces;
		loadWorkspaces();
  });
}

// Load Workspaces
function loadWorkspaces() {
	var workspacesDiv = document.getElementById("workspaces");
  var i, clone, workspaceName, workspace, id;

	for (var workspace in workspaces) {
		workspaceName = workspaces[workspace].name;
		id = workspaceName.replace(/\s+/g, '-').toLowerCase();
		workspace = createWorkspaceButton(workspaceName, id);
		workspacesDiv.appendChild(workspace);
	}
}

// Returns the Button of a Workspace
function createWorkspaceButton(workspaceName, id) {
  var workspacesDiv = document.getElementById("workspaces");
  var workspaceTemplate = document.querySelector("#workspaceTemplate");
  var workspace = document.importNode(workspaceTemplate.content, true).querySelector("li");
  var workspaceNameText;

	workspace.id = id;
  workspace.onclick = function() {
    openWorkspace(workspaceName, id);
  }

  workspaceNameText = workspaceName.toUpperCase();
  workspace.querySelector("p").innerHTML = workspaceNameText;
  return workspace;
}

// Open Workspace Clicked
function openWorkspace(workspaceName, id) {
  var i;
  var tabs = [];
  var workspace = {};

  workspace = getWorkspace(id);
  tabs = workspace.tabs;

  for (i = 0; i < tabs.length; i++) {
    chrome.tabs.create(tabs[i]);
  }
}

// Returns Workspace of Given Name
function getWorkspace(id) {
  return workspaces[id];
}

// Resets Workspace Form to Default View
function resetWorkspaceForm() {
  var errorMsg = document.getElementById("workspaceError");
  var successMsg = document.getElementById("workspaceSuccess");
  var tabs = document.getElementsByClassName('tab');

  numRegularTabs = 0;
  numPinnedTabs = 0;

  while(tabs[0]) {
    tabs[0].parentNode.removeChild(tabs[0]);
  }
  errorMsg.innerHTML = "";
  successMsg.innerHTML = "";
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


  if (workspacesContainer.scrollLeft < (Object.keys(workspaces).length - 4) * 160) {
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

	workspaces.style.whiteSpace = "normal";
  workspaces.style.width = "105%";
  workspaces.style.overflowX = "hidden";
  workspaces.style.overflowY = "scroll";
  workspaces.style.height = "80%";
  hideWebsitesView();
  $("#workspacesContainer").animate({
    height: "100%"}, 1000);

	$("#showAllWorkspaces").hide();
  $("#workspacesBackButton").show();
	$("#workspacesEditButton").show();
  $("#organizeWorkspacesButton").show();

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
  $('#workspaces').animate({scrollTop: 0}, 300);
  workspacesContainer.animate({
    height: "210px"}, 1000);
  $("#workspacesBackButton").hide();
	$("#workspacesEditButton").hide();
  $("#organizeWorkspacesButton").hide();
  $("#showAllWorkspaces").show();
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

// Activate Organization of Workspaces
document.getElementById("organizeWorkspacesButton").onclick = function() {
	this.style.opacity = "1";
	this.style.cursor = "default";

  $('#workspaces li').css('float','left');
  $("#workspaces").sortable({
		disabled: false,
    handle: 'button',
    cancel: '',
    placeholder: 'placeholder',
    forcePlaceholderSize: true
  }).disableSelection();
	$("#workspacesCancelButton").show();
	$("#workspacesSaveButton").show();

	$("#workspacesBackButton").hide();
	$("#workspacesEditButton").hide();
	$("#addWorkspaceButton").hide();

	showHelperMessage("DRAG AND DROP WORKSPACES TO REORDER.<br> DON'T FORGET TO SAVE YOUR CHANGES.", 3000)
}

// Cancel Organization of Workspaces
document.getElementById("workspacesCancelButton").onclick = function() {
	var organizeButton = document.getElementById("organizeWorkspacesButton");
	var workspaceItems = document.getElementsByClassName('workspaceItem');

	organizeButton.style.opacity = "0.8";
	organizeButton.style.cursor = "pointer";
	$('#workspaces li').css('float','none');
	$("#workspaces").sortable({
		disabled: true
	});
	$("#workspacesCancelButton").hide();
	$("#workspacesSaveButton").hide();

	$("#workspacesBackButton").show();
	$("#workspacesEditButton").show();
	$("#addWorkspaceButton").show();

	while(workspaceItems[0]) {
		workspaceItems[0].parentNode.removeChild(workspaceItems[0]);
	}
	loadWorkspaces();
}

// Show helper message
function showHelperMessage(message, duration) {
	$("#helperMessage").html(message);
	$("#helperMessageContainer").slideDown();
	setTimeout(hideHelperMessage, duration)
}

// Hide helper message
function hideHelperMessage() {
	$("#helperMessageContainer").slideUp();
	$("#helperMessage").html("");
}


/////////////////////////
// INITIALIZE
/////////////////////////

addTab("regularTab");
initializeWorkspaces();
