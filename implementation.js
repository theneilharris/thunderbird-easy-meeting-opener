/* eslint-disable object-shorthand */
"use strict";

const { ExtensionCommon } = ChromeUtils.importESModule("resource://gre/modules/ExtensionCommon.sys.mjs");
const { cal } = ChromeUtils.importESModule("resource:///modules/calendar/calUtils.sys.mjs");

var LightningMenus = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    return {
      LightningMenus: {
        async registerMenus() {
          // Get the current window
          const win = Services.wm.getMostRecentWindow("mail:3pane");
          if (!win) return;

          // Get the calendar window
          const calendarWindow = win.document.getElementById("calendar-view");
          if (!calendarWindow) return;

          // Add menu item to the calendar context menu
          const menuItem = win.document.createXULElement("menuitem");
          menuItem.id = "calendar-meeting-opener-menuitem";
          menuItem.setAttribute("label", "Open Meeting Link");
          
          menuItem.addEventListener("command", async () => {
            const selectedItems = calendarWindow.selectedItems;
            if (selectedItems && selectedItems.length > 0) {
              const item = selectedItems[0];
              context.extension.emit("LightningMenus.onCalendarItemClick", {
                title: item.title,
                startDate: new Date(item.startDate).toISOString(),
                endDate: new Date(item.endDate).toISOString(),
                description: item.getProperty("DESCRIPTION") || ""
              });
            }
          });

          const contextMenu = win.document.getElementById("calendar-item-context-menu");
          if (contextMenu) {
            contextMenu.appendChild(menuItem);
          }
        }
      }
    };
  }
};