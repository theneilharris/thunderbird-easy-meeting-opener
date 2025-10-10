console.log("Calendar Meeting Opener starting up...");

// Register the calendar context menu
browser.LightningMenus.registerMenus().then(() => {
  console.log("Calendar menus registered successfully");
}).catch(error => {
  console.error("Error registering menus:", error);
});

function handleContextMenuClick(info, tab) {
  // We can use the calendar API to work with calendar items
  messenger.calendar.getCalendars().then((calendars) => {
    console.log("Available calendars:", calendars);
    // Here you can add specific calendar-related functionality
  }).catch((error) => {
    console.error("Error accessing calendars:", error);
  });
}