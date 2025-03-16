// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;
function loadFile (path) {
  try { var fm = FileManager.iCloud() } catch (e) { var fm = FileManager.local() }
  let code = fm.readString(fm.joinPath(fm.documentsDirectory(), path))
  if (code == null) throw new Error(`Module '${path}' not found.`)
  return Function(`${code}; return exports`)()
}
const credentials = loadFile('Intervals.js')

let param = parseInt(args.widgetParameter);
param = (isNaN(param) ? 0 : param);

// Determine if the focus is on Power Zones or Heart Rate Zones
let title = "Power Zones";
if (param != 1) {
  title = "HR Zones";
}

// Calculate the date one week ago
let date = new Date();
date.setDate(date.getDate() - 7);
let oldestDate = date.toISOString().split('T')[0];

// API URL with a dynamic "oldest" parameter
const apiUrl = `https://intervals.icu/api/v1/athlete/${credentials.userID}/activities?oldest=${oldestDate}`;

const authHeader = "Basic " + btoa("API_KEY" + ":" + credentials.apiPassword);

function formatTime(seconds) {
  let hours = Math.floor(seconds / 3600);
  let minutes = Math.floor((seconds % 3600) / 60);
  let secs = seconds % 60;

  // Dynamische Darstellung basierend auf Vorhandensein der Stunden
  return hours > 0 
    ? `${hours}h${minutes}m${secs}s`
    : `${minutes}m${secs}s`;
}

// Function to fetch the last activity
async function getLastActivity() {
  let req = new Request(apiUrl);
  req.headers = { "Authorization": authHeader };
  
  let response = await req.loadJSON();
  return response[0]; // Return the first activity from the response
}

// Colors for the bars
let barColors = [new Color("#40E0D0"), new Color("#32CD32"), new Color("#FFD700"), new Color("#FFA500"), new Color("#FF0000")]; // Turquoise, Green, Yellow, Orange, Red

async function createWidget() {
  let activity = await getLastActivity();
  let zone_times = [];
  
  // Use HR zones if the parameter is not 1, otherwise power
  if (param === 1) 
  {
    if(activity.icu_zone_times != null)
      zone_times = activity.icu_zone_times.map(i => (i.secs).toFixed(0));
  }
  else 
  {
    if(activity.icu_hr_zone_times != null)
      zone_times = activity.icu_hr_zone_times.map(i => (i).toFixed(0)); 
  }

  let widget = new ListWidget();

  // Add the title to the widget
  let header = widget.addText(title);
  header.font = Font.boldSystemFont(12);
  header.centerAlignText();

  widget.addSpacer(10);

  // Dimensions and spacing for the bars and times
  const width = 310; // Total width
  const height = 110; // Total height
  const spacing = 5; // Spacing between elements
  const topSpacing = 10; // Top spacing
  const rightSpacing = 60;
  const cornerRadius = 4; // Corner radius for bars
  const max = Math.max(...zone_times); // Maximum value in zone times

  // Main container with two columns
  const container = widget.addStack();
  container.size = new Size(width, height);
  container.layoutHorizontally();
  container.spacing = 2;

  // Left column for bars
  const barContainer = container.addStack();
  barContainer.layoutVertically();
  barContainer.centerAlignContent();
  barContainer.spacing = spacing;


  container.addSpacer(10);
  // Right column for times
  const timeContainer = container.addStack();
  timeContainer.layoutVertically();
  timeContainer.centerAlignContent();
  timeContainer.spacing = spacing + 2;

  // Add bars and times to the widget
  zone_times.forEach((value, index) => {
    // Bar
    let bar = barContainer.addStack();
    bar.backgroundColor = barColors[index % barColors.length];
    bar.cornerRadius = cornerRadius;
    bar.size = new Size(
      ((width - rightSpacing) / max) * value,
      ((height - topSpacing) - zone_times.length * spacing) / zone_times.length
    );

    // Time
    let timeText = timeContainer.addText(formatTime(value));
    timeText.font = Font.systemFont(11);
    timeText.centerAlignText();
  });

  return widget;
}

// Execute the function
let widget = await createWidget();
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentMedium();
}
Script.complete();
