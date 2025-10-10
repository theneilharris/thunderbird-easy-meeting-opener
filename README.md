# Thunderbird Meeting Link Opener

A Thunderbird extension that adds a context menu option to quickly open online meeting links from calendar events.

## Features

- Adds "Open Meeting Link" option to calendar event context menu
- Automatically enables/disables menu item based on link presence
- Supports Microsoft Teams meeting links
- Supports Google Meet links
- Works in various calendar views (day, week, month)
- Opens links in your default browser
- No configuration needed

## Supported Meeting Types

### Microsoft Teams
- Direct meeting links (`https://teams.live.com/meet/...`)
- Meeting links in HTML format (`<https://teams.live.com/meet/...>`)
- Meetings with separate ID and Passcode

### Google Meet
- Direct meeting links (`https://meet.google.com/...`)

## What This Extension Does NOT Do

- Does NOT handle Zoom meetings (yet)
- Does NOT handle WebEx meetings (yet)
- Does NOT automatically join meetings
- Does NOT handle phone numbers or dial-in information
- Does NOT modify your calendar events
- Does NOT send any data outside of Thunderbird
- Does NOT work with non-meeting calendar events
- Does NOT automatically detect upcoming meetings
- Does NOT provide meeting notifications (use Thunderbird's built-in reminders)

## How to Use

1. **Select a Calendar Event**:
   - Navigate to your calendar in Thunderbird
   - Find the meeting you want to join

2. **Open the Meeting Link**:
   - Right-click on the calendar event
   - The "Open Meeting Link" menu item will be enabled if a meeting link is found
   - Select "Open Meeting Link" from the context menu
   - The meeting link will open in your default browser

3. **Smart Menu Behavior**:
   - The "Open Meeting Link" menu item is automatically enabled/disabled
   - Enabled: When the right-clicked event contains a supported meeting link
   - Disabled: When no meeting link is found
   - If you try to open a disabled link, you'll see a message explaining why

## Tips

- The menu item is automatically enabled/disabled based on the right-clicked event
- You can right-click any event to check if it has a meeting link
- Links must be in the event description to be detected
- If a meeting has multiple links, the Teams link will be preferred over Meet
- Works in all calendar views (day, week, month, multiweek)

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

If the "Open Meeting Link" option is always disabled:
1. Make sure you're right-clicking directly on a calendar event
2. Check if the event actually contains a meeting link
3. Try viewing the event details to verify the link is in the description
4. Restart Thunderbird if the menu seems stuck

If the link doesn't open:
1. Check if your default browser is properly configured
2. Try copying the meeting link manually to verify it's valid
3. Check the Error Console (Tools → Developer Tools → Error Console) for error messages

## Contributing

Feel free to open issues for:
- Bug reports
- Feature requests
- Support for additional meeting types
- Documentation improvements

## License

[Add your chosen license here]