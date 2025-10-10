/**
 * Meeting Opener Extension for Thunderbird
 * This extension adds a context menu item to calendar events that allows users to
 * quickly open meeting links (Teams, Meet) found in the event description.
 * The menu item is dynamically enabled/disabled based on whether the right-clicked
 * event contains a supported meeting link.
 */

"use strict";

// Import the common extension utilities from Thunderbird
var { ExtensionCommon } = ChromeUtils.importESModule(
  "resource://gre/modules/ExtensionCommon.sys.mjs"
);

/**
 * Main extension API implementation
 * Extends the base ExtensionAPI class to provide calendar integration functionality
 */
this.LightningMenus = class extends ExtensionCommon.ExtensionAPI {
  /**
   * Extracts Microsoft Teams meeting URL from event description
   * Handles multiple Teams URL formats:
   * 1. URLs in angle brackets <https://teams.live.com/...>
   * 2. Plain URLs https://teams.live.com/...
   * 3. Meeting ID and Passcode format
   * 
   * @param {string} description - The calendar event description text
   * @returns {string} The Teams meeting URL or empty string if none found
   */
  getTeamsMeetingUrl(description) {
    // First try: Look for the URL between < and >
    // This format is common in HTML-formatted event descriptions
    var bracketUrlRegex = /<(https:\/\/teams\.live\.com\/meet\/[^>]+)>/;
    var bracketMatch = description.match(bracketUrlRegex);
    
    if (bracketMatch && bracketMatch[1]) {
      console.log("Found Teams URL in brackets:", bracketMatch[1]);
      return bracketMatch[1];
    }

    // Second try: Look for any Teams URL
    // This catches plain text URLs without brackets
    var urlRegex = /https:\/\/teams\.live\.com\/meet\/[\w\d?=&]+/;
    var match = description.match(urlRegex);
    
    if (match && match[0]) {
      console.log("Found Teams URL:", match[0]);
      return match[0];
    }

    // Third try: Try to construct from Meeting ID and Passcode
    // Some meeting invites provide ID and passcode separately
    var meetingIdMatch = description.match(/Meeting ID:\s*([\d\s]+)/);
    var passcodeMatch = description.match(/Passcode:\s*([^\s\n]+)/);
    
    if (meetingIdMatch && passcodeMatch) {
      var meetingId = meetingIdMatch[1].replace(/\s+/g, '');
      var passcode = passcodeMatch[1];
      console.log("Constructed Teams URL from ID:", meetingId, "and passcode:", passcode);
      return `https://teams.live.com/meet/${meetingId}?p=${passcode}`;
    }

    console.log("No Teams URL found in description");
    return "";
  }

  /**
   * Extracts Google Meet URL from event description
   * Handles Meet URLs in various formats
   * 
   * @param {string} description - The calendar event description text
   * @returns {string} The Google Meet URL or empty string if none found
   */
  getMeetMeetingUrl(description) {
    var urlRegex = /(https:\/\/meet\.google\.com\/[^>\s]+)/;
    var match = description.match(urlRegex);

    if (match && match[1]) {
      console.log("Found Google Meet URL:", match[1]);
      return match[1];
    }

    return "";
  }

  /**
   * Checks if the given event description contains any supported meeting link
   * (Teams or Google Meet)
   * 
   * @param {string} description - The calendar event description text
   * @returns {boolean} True if the description contains a supported meeting link
   */
  hasMeetingLink(description) {
    if (!description) {
      return false;
    }
    
    // Try Teams first
    const teamsUrl = this.getTeamsMeetingUrl(description);
    if (teamsUrl) {
      return true;
    }
    
    // Then try Google Meet
    const meetUrl = this.getMeetMeetingUrl(description);
    return !!meetUrl;
  }

  /**
   * Gets the selected calendar event from the window
   * This extracts the event object using the same logic as the click handler
   * 
   * @param {Window} window - The window to check for selected event
   * @returns {Object} The selected calendar event object or null if none found
   */
  getSelectedEvent(window) {
    console.log("WebExtensions: Getting selected event from window");
    try {
      // Get the main calendar window
      var mainWindow = window.document.getElementById("messengerWindow");
      if (!mainWindow) {
        console.log("WebExtensions: Could not find messenger window");
        return null;
      }

      // Get the calendar tab panel
      var tabpanels = mainWindow.querySelector("#tabpanelcontainer");
      if (!tabpanels) {
        console.log("WebExtensions: Could not find tab panels");
        return null;
      }

      // Get the selected panel
      var selectedPanel = tabpanels.querySelector("[selected='true']");
      if (!selectedPanel) {
        console.log("WebExtensions: Could not find selected panel");
        return null;
      }

      console.log("WebExtensions: Found selected panel:", selectedPanel.id);

      var calEvent = null;

      // Try multiweek view first as it's most reliable
      var multiWeekView = window.document.querySelector("calendar-multiweek-view");
      if (multiWeekView) {
        console.log("WebExtensions: Found multiweek view");
        try {
          if (multiWeekView.selectedItem) {
            calEvent = multiWeekView.selectedItem;
            console.log("WebExtensions: Found event via multiweek view selectedItem");
            console.log("WebExtensions: Event type:", calEvent.constructor.name);
          } else if (multiWeekView.getSelectedItems) {
            var items = multiWeekView.getSelectedItems({});
            console.log("WebExtensions: getSelectedItems returned", items ? items.length : 0, "items");
            if (items && items.length > 0) {
              calEvent = items[0];
              console.log("WebExtensions: Found event via getSelectedItems");
              console.log("WebExtensions: Event type:", calEvent.constructor.name);
            }
          }
        } catch (e) {
          console.error("WebExtensions: Error accessing multiweek view:", e);
          console.error(e);
        }
      }

      // If no event found, try week view
      if (!calEvent) {
        console.log("WebExtensions: Searching week view for selected items");
        var weekView = window.document.querySelector(".calendar-week-view");
        if (weekView) {
          console.log("WebExtensions: Found week view");
          var selectedItems = weekView.querySelectorAll("[selected='true']");
          console.log("WebExtensions: Selected items found:", selectedItems.length);
          
          selectedItems.forEach((item, index) => {
            console.log("WebExtensions: Checking selected item", index);
            console.log("WebExtensions: Item properties:", 
              Object.getOwnPropertyNames(item).join(", "));
            if (item.occurrence && !calEvent) {
              calEvent = item.occurrence;
              console.log("WebExtensions: Found event via selected item occurrence");
              console.log("WebExtensions: Event type:", calEvent.constructor.name);
            } else if (item.item && !calEvent) {
              calEvent = item.item;
              console.log("WebExtensions: Found event via selected item.item");
              console.log("WebExtensions: Event type:", calEvent.constructor.name);
            }
          });
        }
      }

      return calEvent;
    } catch (err) {
      console.error("Error getting selected event:", err);
      return null;
    }
  }

  /**
   * Gets the description from a calendar event
   * Tries multiple methods to extract the description
   * 
   * @param {Object} calEvent - The calendar event object
   * @returns {string} The event description or empty string if none found
   */
  getEventDescription(calEvent) {
    console.log("WebExtensions: Getting description for event:", calEvent);
    
    if (!calEvent) {
      console.log("WebExtensions: No calendar event provided");
      return "";
    }

    try {
      // Log available properties on the event
      console.log("WebExtensions: Event properties available:", 
        Object.getOwnPropertyNames(calEvent).join(", "));

      // Try multiple methods to get the description
      let description = "";
      
      if (calEvent.getProperty) {
        console.log("WebExtensions: Trying getProperty method");
        description = calEvent.getProperty("DESCRIPTION");
        console.log("WebExtensions: getProperty result:", description);
      }
      
      if (!description && calEvent.description) {
        console.log("WebExtensions: Trying description property");
        description = calEvent.description;
        console.log("WebExtensions: description property result:", description);
      }
      
      if (!description && calEvent.event) {
        console.log("WebExtensions: Trying event object");
        if (calEvent.event.getProperty) {
          description = calEvent.event.getProperty("DESCRIPTION");
          console.log("WebExtensions: event.getProperty result:", description);
        }
        if (!description && calEvent.event.description) {
          description = calEvent.event.description;
          console.log("WebExtensions: event.description result:", description);
        }
      }

      // Try additional potential properties
      if (!description && calEvent.item) {
        console.log("WebExtensions: Trying item property");
        if (calEvent.item.getProperty) {
          description = calEvent.item.getProperty("DESCRIPTION");
          console.log("WebExtensions: item.getProperty result:", description);
        }
        if (!description && calEvent.item.description) {
          description = calEvent.item.description;
          console.log("WebExtensions: item.description result:", description);
        }
      }
      
      console.log("WebExtensions: Final description:", description || "(empty string)");
      return description || "";
    } catch (e) {
      console.error("WebExtensions: Error getting description:", e);
      return "";
    }
  }

  /**
   * Implements the extension's API
   * This is the main entry point for the extension's functionality
   * 
   * @param {object} context - The extension context
   * @returns {object} The API implementation
   */
  getAPI(context) {
    var self = this;

    return {
      LightningMenus: {
        /**
         * Registers the context menu in calendar windows
         * Sets up menu items and event handlers for both existing and new windows
         * 
         * @returns {Promise} Resolves when menu registration is complete
         */
        async registerMenus() {
          return new Promise((resolve, reject) => {
            try {
              /**
               * Handles clicks on the context menu item
               * Finds the selected calendar event and extracts meeting URLs
               * 
               * @param {Event} event - The click event object
               */
              function handleMenuClick(event) {
                try {
                  console.log("Menu item clicked");
                  var targetWindow = event.target.ownerGlobal;
                  
                  // Get the main calendar window
                  // The messengerWindow contains all Thunderbird's main UI
                  var mainWindow = targetWindow.document.getElementById("messengerWindow");
                  if (!mainWindow) {
                    console.log("Could not find messenger window");
                    return;
                  }

                  // Get the calendar tab panel
                  // Calendar view is contained within a tab panel
                  var tabpanels = mainWindow.querySelector("#tabpanelcontainer");
                  if (!tabpanels) {
                    console.log("Could not find tab panels");
                    return;
                  }

                  // Get the selected panel
                  // This is the currently visible calendar view
                  var selectedPanel = tabpanels.querySelector("[selected='true']");
                  if (!selectedPanel) {
                    console.log("Could not find selected panel");
                    return;
                  }

                  // Try to get the selected event using multiple methods
                  var calEvent = null;
                  try {
                    console.log("Searching for selected event in week view...");
                    
                    // First try: Get the clicked element and traverse up to find event data
                    // The event data might be on a parent element of what was clicked
                    var contextMenu = event.target.parentNode;
                    if (contextMenu && contextMenu.triggerNode) {
                      var clickedElement = contextMenu.triggerNode;
                      console.log("Right-clicked element found");
                      console.log("- Element tag:", clickedElement.tagName);
                      console.log("- Element class:", clickedElement.className);
                      console.log("- Element id:", clickedElement.id);
                      
                      // Walk up the parent chain to find the event container
                      // Calendar event data could be several levels up from the clicked element
                      var currentElement = clickedElement;
                      var maxDepth = 10; // Prevent infinite loops
                      var depth = 0;
                      
                      while (currentElement && depth < maxDepth) {
                        console.log(`Checking element at depth ${depth}:`);
                        console.log("- Tag:", currentElement.tagName);
                        console.log("- Class:", currentElement.className);
                        console.log("- Has occurrence:", !!currentElement.occurrence);
                        console.log("- Has item:", !!currentElement.item);
                        console.log("- Has event:", !!currentElement.event);
                        
                        // Try to get the event data from various properties
                        // Different Thunderbird versions might use different property names
                        if (currentElement.occurrence) {
                          calEvent = currentElement.occurrence;
                          console.log("Found event via occurrence property at depth", depth);
                          break;
                        } else if (currentElement.item) {
                          calEvent = currentElement.item;
                          console.log("Found event via item property at depth", depth);
                          break;
                        } else if (currentElement.event) {
                          calEvent = currentElement.event;
                          console.log("Found event via event property at depth", depth);
                          break;
                        } else if (currentElement.getAttribute && currentElement.hasAttribute("occurrence")) {
                          try {
                            calEvent = JSON.parse(currentElement.getAttribute("occurrence"));
                            console.log("Found event via occurrence attribute at depth", depth);
                            break;
                          } catch (e) {}
                        }
                        
                        // Try calendar-specific element selectors
                        // Look for elements that match known calendar item classes
                        if (currentElement.matches && (
                            currentElement.matches(".calendar-event-box") ||
                            currentElement.matches(".calendar-item") ||
                            currentElement.matches("[is='calendar-event-box']") ||
                            currentElement.matches("[is='calendar-item']"))) {
                          console.log("Found calendar event container at depth", depth);
                          if (currentElement.occurrence || currentElement.item || currentElement.event) {
                            calEvent = currentElement.occurrence || currentElement.item || currentElement.event;
                            console.log("Found event via container element");
                            break;
                          }
                        }
                        
                        // Move up to parent for next iteration
                        currentElement = currentElement.parentNode;
                        depth++;
                      }
                      
                      // If we found a calendar event, log its properties for debugging
                      if (calEvent) {
                        console.log("Calendar event properties:");
                        for (var prop in calEvent) {
                          try {
                            if (typeof calEvent[prop] !== 'function') {
                              console.log(`- ${prop}:`, calEvent[prop]);
                            }
                          } catch (e) {}
                        }
                      }
                    }

                    // Second try: Look for selected items in the week view
                    // This method works when an event is selected but not right-clicked
                    if (!calEvent) {
                      console.log("Searching week view for selected items");
                      var weekView = targetWindow.document.querySelector(".calendar-week-view");
                      if (weekView) {
                        console.log("Found week view");
                        var selectedItems = weekView.querySelectorAll("[selected='true']");
                        console.log("Selected items found:", selectedItems.length);
                        
                        selectedItems.forEach((item, index) => {
                          console.log(`Selected item ${index}:`);
                          console.log("- Tag:", item.tagName);
                          console.log("- Class:", item.className);
                          console.log("- Has occurrence:", !!item.occurrence);
                          if (item.occurrence && !calEvent) {
                            calEvent = item.occurrence;
                            console.log("Found event via selected item");
                          }
                        });
                      }
                    }

                    // Third try: Check the calendar view controller
                    // This uses the calendar's API to get selected items
                    if (!calEvent) {
                      var multiWeekView = targetWindow.document.querySelector("calendar-multiweek-view");
                      if (multiWeekView) {
                        console.log("Found multiweek view");
                        try {
                          if (multiWeekView.selectedItem) {
                            calEvent = multiWeekView.selectedItem;
                            console.log("Found event via multiweek view selectedItem");
                          } else if (multiWeekView.getSelectedItems) {
                            var items = multiWeekView.getSelectedItems({});
                            if (items && items.length > 0) {
                              calEvent = items[0];
                              console.log("Found event via getSelectedItems");
                            }
                          }
                        } catch (e) {
                          console.error("Error accessing multiweek view:", e);
                        }
                      }
                    }
                  } catch (e) {
                    console.error("Error finding selected event:", e);
                  }

                  if (!calEvent) {
                    console.log("No selected event found");
                    targetWindow.alert("Please select a calendar event first");
                    return;
                  }

                  // Get the event description using multiple methods
                  // The description might be available in different ways
                  var description = "";
                  try {
                    if (calEvent.getProperty) {
                      description = calEvent.getProperty("DESCRIPTION");
                    }
                    
                    if (!description && calEvent.description) {
                      description = calEvent.description;
                    }
                    
                    if (!description && calEvent.event) {
                      description = calEvent.event.getProperty("DESCRIPTION") ||
                                  calEvent.event.description;
                    }
                  } catch (e) {
                    console.error("Error getting description:", e);
                  }
                  
                  description = description || "";
                  console.log("Event description:", description);

                  // Look for meeting URLs in the description
                  // Try Teams first, then Google Meet
                  var url = self.getTeamsMeetingUrl(description);

                  if (!url) {
                    url = self.getMeetMeetingUrl(description);
                  }

                  if (url) {
                    console.log("Opening URL:", url);
                    try {
                      // Create a nsIURI object for the URL
                      var uri = Components.classes["@mozilla.org/network/io-service;1"]
                               .getService(Components.interfaces.nsIIOService)
                               .newURI(url);
                               
                      // Get the protocol handler to open URLs
                      var protocolSvc = Components.classes["@mozilla.org/uriloader/external-protocol-service;1"]
                                      .getService(Components.interfaces.nsIExternalProtocolService);
                      
                      // Open the URL in the default browser
                      protocolSvc.loadURI(uri);
                    } catch (e) {
                      console.error("Error opening URL:", e);
                      // Fallback method if the protocol service fails
                      targetWindow.open(url);
                    }
                  } else {
                    console.log("No URLs found in description");
                    targetWindow.alert("No meeting link found in this event");
                  }
                } catch (err) {
                  console.error("Error handling menu click:", err);
                }
              }

              /**
               * Adds the context menu item to a window
               * Creates and sets up the menu item in the calendar context menu
               * 
               * @param {Window} window - The window to add the menu to
               */
              function addMenuToWindow(window) {
                try {
                  console.log("Adding menu to window...");
                  
                  if (!window || !window.document) {
                    console.error("Invalid window object");
                    return;
                  }

                  // Wait for the document to be fully loaded
                  // Some windows might not be ready when we try to add the menu
                  if (window.document.readyState !== "complete") {
                    window.addEventListener("load", function() {
                      addMenuToWindow(window);
                    });
                    return;
                  }

                  // Remove existing menu item if it exists
                  // This prevents duplicate items if the extension is reloaded
                  var existingItem = window.document.getElementById("calendar-meeting-opener-menuitem");
                  if (existingItem) {
                    existingItem.remove();
                  }

                  // Create menu item
                  var menuItem = window.document.createXULElement("menuitem");
                  menuItem.setAttribute("id", "calendar-meeting-opener-menuitem");
                  menuItem.setAttribute("label", "Open Meeting Link");
                  menuItem.setAttribute("disabled", "true"); // Disabled by default
                  menuItem.addEventListener("command", handleMenuClick);

                  // Function to update menu item state based on selection
                  function updateMenuItemState(event) {
                    console.log("WebExtensions: Updating menu item state");
                    
                    let calEvent = null;
                    
                    // If this is a context menu event, use the trigger node
                    if (event && event.type === "popupshowing") {
                      const contextMenu = event.target;
                      const triggerNode = contextMenu.triggerNode;
                      
                      if (triggerNode) {
                        console.log("WebExtensions: Context menu triggered on:", triggerNode.tagName);
                        
                        // Walk up from trigger node to find event
                        let currentElement = triggerNode;
                        for (let i = 0; i < 5 && currentElement && !calEvent; i++) {
                          if (currentElement.occurrence) {
                            calEvent = currentElement.occurrence;
                          } else if (currentElement.item) {
                            calEvent = currentElement.item;
                          } else if (currentElement.event) {
                            calEvent = currentElement.event;
                          }
                          currentElement = currentElement.parentNode;
                        }
                      }
                    }
                    
                    // If we didn't find an event from the context menu, try selected event
                    if (!calEvent) {
                      calEvent = self.getSelectedEvent(window);
                    }
                    
                    if (calEvent) {
                      console.log("WebExtensions: Found calendar event");
                      const description = self.getEventDescription(calEvent);
                      console.log("WebExtensions: Description length:", description ? description.length : 0);
                      
                      const hasLink = self.hasMeetingLink(description);
                      console.log("WebExtensions: Has meeting link:", hasLink);
                      
                      menuItem.setAttribute("disabled", !hasLink);
                    } else {
                      console.log("WebExtensions: No calendar event found, disabling menu item");
                      menuItem.setAttribute("disabled", "true");
                    }
                  }
                  
                  // Find the calendar context menu
                  var contextMenu = window.document.getElementById("calendar-item-context-menu");
                  console.log("Context menu found:", !!contextMenu);
                  
                  if (contextMenu) {
                    // Add separator first for visual separation
                    var separator = window.document.createXULElement("menuseparator");
                    contextMenu.appendChild(separator);
                    
                    // Add menu item
                    contextMenu.appendChild(menuItem);
                    console.log("Menu item added successfully");

                    // Update state when context menu is about to show
                    contextMenu.addEventListener("popupshowing", updateMenuItemState);

                    // Set up selection change listeners on calendar views
                    const setupViewListeners = (view) => {
                      if (!view) return;
                      
                      // The selection change events we want to listen for
                      const events = ["select", "dayselect", "itemselect"];
                      
                      events.forEach(eventName => {
                        view.addEventListener(eventName, updateMenuItemState);
                      });
                      
                      console.log("Selection listeners added to view:", view.tagName);
                    };

                    // Add listeners to both week and multiweek views
                    const weekView = window.document.querySelector(".calendar-week-view");
                    const multiWeekView = window.document.querySelector("calendar-multiweek-view");
                    
                    setupViewListeners(weekView);
                    setupViewListeners(multiWeekView);
                  } else {
                    console.error("Could not find calendar context menu");
                  }
                } catch (err) {
                  console.error("Error adding menu to window:", err);
                }
              }

              // Add menu to all existing windows
              // Get the window mediator service to find all open windows
              var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                               .getService(Components.interfaces.nsIWindowMediator);
              var windows = wm.getEnumerator("mail:3pane");
              while (windows.hasMoreElements()) {
                var window = windows.getNext();
                if (window) {
                  addMenuToWindow(window);
                }
              }

              // Set up listener for new windows
              // This ensures the menu is added to any windows opened after extension load
              var windowListener = {
                onOpenWindow: function(xulWindow) {
                  var domWindow = xulWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                                        .getInterface(Components.interfaces.nsIDOMWindowInternal ||
                                                    Components.interfaces.nsIDOMWindow);
                  domWindow.addEventListener("load", function listener() {
                    domWindow.removeEventListener("load", listener);
                    if (domWindow.document.documentElement
                        .getAttribute("windowtype") === "mail:3pane") {
                      addMenuToWindow(domWindow);
                    }
                  });
                },
                onCloseWindow: function() {},
                onWindowTitleChange: function() {}
              };

              wm.addListener(windowListener);
              
              // Cleanup when extension is disabled or uninstalled
              context.callOnClose({
                close: function() {
                  wm.removeListener(windowListener);
                }
              });

              resolve();
            } catch (err) {
              console.error("Error registering menus:", err);
              reject(err);
            }
          });
        }
      }
    };
  }
};