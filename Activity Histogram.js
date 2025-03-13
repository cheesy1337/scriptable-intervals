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
param = (isNaN(param) ? 1 : param);

// Define the type of histogram (Power or HR)
let histogramUrl = "power-histogram";
let title = "Power Histogram";
let minBucket = 50;   // show only buckets with power > 50
if(param != 1)
{
 	histogramUrl = "hr-histogram" 
  title = "HR Histogram";
  minBucket = 90;   // show only buckets with hr>90
}

// Calculate the date one week ago
let date = new Date();
date.setDate(date.getDate() - 7);
let oldestDate = date.toISOString().split('T')[0];

// API URLs for fetching activities and histograms
const apiUrl = `https://intervals.icu/api/v1/athlete/${credentials.userID}/activities?oldest=${oldestDate}`;
const apiActivityUrl = `https://intervals.icu/api/v1/activity/`;

const authHeader = "Basic " + btoa("API_KEY" + ":" + credentials.apiPassword);

// Function to fetch the last activity
async function getLastActivity() {
  let req = new Request(apiUrl);
  req.headers = { "Authorization": authHeader };
  
  let response = await req.loadJSON();
  return response[0]; // Return the first activity from the response
}

// Function to fetch the histogram of the last activity
async function getHistogram(activityID) {
  let url = apiActivityUrl.concat(activityID, "/", histogramUrl);
  let req = new Request(url);
  req.headers = { "Authorization": authHeader };
  
  let response = await req.loadJSON();
  return response; // Return the histogram data
}

// Function to determine the color for the bars based on zones
function getColor(maxValue, zones) {
  let color;
  if (maxValue <= zones[0]) {
    color = new Color("#40E0D0"); // Turquoise
  } else if (maxValue <= zones[1]) {
    color = new Color("#32CD32"); // Green
  } else if (maxValue <= zones[2]) {
    color = new Color("#FFD700"); // Yellow
  } else if (maxValue <= zones[3]) {
    color = new Color("#FFA500"); // Orange
  } else {
    color = new Color("#FF0000"); // Red
  }
  
  return color;
}

// Function to create the widget
async function createWidget() {
  let activity = await getLastActivity();
  let histogram = await getHistogram(activity.id);
  let zones = activity.icu_power_zones.map(i => Math.round(i * activity.icu_ftp / 100));
  
  // Use HR zones if the parameter is not 1
  if (param != 1) {
    zones = activity.icu_hr_zones;
  }
  
  
  histogram = histogram.filter(i => i.min >= minBucket);
  let zone_times = histogram.map(i => (i.secs / 60).toFixed(1));   

  let widget = new ListWidget(); 

  // Add a title to the widget
  let header = widget.addText(title);
  header.font = Font.boldSystemFont(12);
  header.centerAlignText();

  widget.addSpacer(10);

  // Dimensions for the bars and widget container
  const width = 300; // Total width of the widget
  const height = 110; // Total height of the widget
  const spacing = 3; // Spacing between elements
  const topSpacing = 15; // Top spacing for bars
  const cornerRadius = 4; // Corner radius for the bars
  const max = Math.max(...zone_times); // Maximum value in zone times

  const container = widget.addStack();
  container.bottomAlignContent();
  container.size = new Size(width, height);
  container.layoutHorizontally();
  container.spacing = spacing;

  // Draw bars and add values
  zone_times.forEach((value, index) => {
    let barStack = container.addStack();
    barStack.layoutVertically();

    let bar = barStack.addStack();
    bar.backgroundColor = getColor(histogram[index].max, zones); // Assign color based on the zone
    bar.cornerRadius = cornerRadius;
    bar.size = new Size((width - zone_times.length * spacing) / zone_times.length, ((height - topSpacing) / max) * value);

    barStack.addSpacer(2);

    let valueLabel = barStack.addText(`${histogram[index].min.toString()}`);
    valueLabel.font = Font.systemFont(8);
    valueLabel.leftAlignText();
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
