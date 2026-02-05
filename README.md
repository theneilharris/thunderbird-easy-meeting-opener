# Thunderbird Meeting Link Opener

A Thunderbird extension that adds a context menu option to quickly open online meeting links from calendar events.

## Features

- Adds "Open Meeting Link" option to calendar event context menu
- Automatically enables/disables menu item based on link presence
- Adds "Join Meeting" button to calendar reminder/alarm popups
- Supports Microsoft Teams meeting links
- Supports Zoom meeting links
- Supports Google Meet links
- Supports kMeet (Infomaniak) meeting links
- Adds "Email Attendees" option to quickly compose mail to event participants
- Works in various calendar views (day, week, month)
- Opens links in your default browser
- No configuration needed

## Supported Meeting Types

### Microsoft Teams
- Direct meeting links (`https://teams.live.com/meet/...`)
- Meeting links (`https://teams.microsoft.com/l/meetup-join/...`)
- Meeting links in HTML format (`<https://teams.live.com/meet/...>`)

### Zoom
- Direct meeting links (`https://zoom.us/j/...`)
- Supports various Zoom domains (zoom.us, zoom.com, etc.)

### Google Meet
- Direct meeting links (`https://meet.google.com/...`)

### kMeet (Infomaniak)
- Direct meeting links (`https://kmeet.infomaniak.com/...`)
- Custom domain meeting links (`https://kmeet.my-company.tld/...`)
- Meeting links in HTML format (`<https://kmeet.infomaniak.com/...>`)
- Supports any domain starting with `kmeet.`

## What This Extension Does NOT Do

- Does NOT handle WebEx meetings (yet)
- Does NOT automatically join meetings
- Does NOT handle phone numbers or dial-in information
- Does NOT modify your calendar events
- Does NOT send any data outside of Thunderbird
- Does NOT work with non-meeting calendar events
- Does NOT automatically detect upcoming meetings
- Does NOT provide meeting notifications (use Thunderbird's built-in reminders)

## How to Use

### Method 1: Join from Reminder Popup

 **When a reminder pops up**:
   - A reminder window will appear before your meeting
   - If the event contains a meeting link, a **"Join Meeting"** button will appear
   - Click the "Join Meeting" button to open the meeting in your default browser
   - You can still snooze or dismiss the reminder as usual

### Method 2: Join from Calendar Context Menu

 **Select a Calendar Event**:
   - Navigate to your calendar in Thunderbird
   - Find the meeting you want to join

 **Open the Meeting Link**:
   - Right-click on the calendar event
   - The "Open Meeting Link" menu item will be enabled if a meeting link is found
   - Select "Open Meeting Link" from the context menu
   - The meeting link will open in your default browser

### Email Attendees

- Right-click on any calendar event
- Select "Email Attendees" from the context menu (enabled when attendees are found)
- Thunderbird's compose window will open with attendee addresses, subject and body pre-filled

 **Smart Menu Behavior**:
   - The "Open Meeting Link" menu item is automatically enabled/disabled
   - Enabled: When the right-clicked event contains a supported meeting link
   - Disabled: When no meeting link is found
   - If you try to open a disabled link, you'll see a message explaining why

## Tips

- **Reminder Button**: The "Join Meeting" button appears automatically in reminder popups when a meeting link is detected
- The context menu item is automatically enabled/disabled based on the right-clicked event
- You can right-click any event to check if it has a meeting link
- Links must be in the event description to be detected
- If a meeting has multiple links, the order of preference is: Teams, Zoom, kMeet, then Google Meet
- Works in all calendar views (day, week, month, multiweek)
- Set up calendar reminders (5-10 minutes before meetings) to get the convenient "Join Meeting" button

## Installation

1. Download the extension file (`.xpi`)
2. In Thunderbird:
   - Go to Tools → Add-ons
   - Click the gear icon and select "Install Add-on From File"
   - Select the downloaded `.xpi` file
   - Click "Add"
   - Restart Thunderbird if prompted

## Requirements

- Thunderbird 115 or later
- Calendar add-on enabled
- Default browser configured on your system

## Known Issues

- May not detect some specially formatted meeting links
- Meeting links in attachments are not detected
- Links in recurring events work the same as regular events
- Menu item state updates only on right-click or selection change

## Privacy

This extension:
- Only reads calendar event data within Thunderbird
- Does not collect or transmit any data
- Does not modify your calendar events
- Only opens links in your default browser

## Troubleshooting

### "Join Meeting" button doesn't appear in reminder popup:
1. Make sure the meeting link is in the event **description** field
2. Verify the link format is supported (Teams, Zoom, kMeet, or Google Meet)
3. Check the Error Console (Tools → Developer Tools → Error Console) for messages
4. The button only appears when a valid meeting link is detected

### "Open Meeting Link" option is always disabled:
1. Make sure you're right-clicking directly on a calendar event
2. Check if the event actually contains a meeting link
3. Try viewing the event details to verify the link is in the description
4. Restart Thunderbird if the menu seems stuck

### Link doesn't open:
1. Check if your default browser is properly configured
2. Try copying the meeting link manually to verify it's valid
3. Check the Error Console (Tools → Developer Tools → Error Console) for error messages

## Contributing

Feel free to open issues for:
- Bug reports
- Feature requests
- Support for additional meeting types
- Documentation improvements
