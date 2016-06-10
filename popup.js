document.getElementById("createNewWorkspace").onclick = function() {
  chrome.storage.sync.get({workspaces: []}, function(data) {
    var workspaces = data.workspaces;
    console.log(workspaces);
    chrome.tabs.getAllInWindow(function(tabs) {
      var workspaceTabs = [];

      for (i = 0; i < tabs.length; i++) {
        var tab = {
          url: tabs[i].url,
          pinned: tabs[i].pinned,
          active: false
        }
        workspaceTabs.push(tab);
      }

      var workspaceName = document.getElementById("workspaceName").value;

      var newWorkspace = {
        name: workspaceName,
        tabs: workspaceTabs
      }

      workspaces.push(newWorkspace);
      console.log(workspaces);

      chrome.storage.sync.set({workspaces: workspaces});
    });
  });
}
