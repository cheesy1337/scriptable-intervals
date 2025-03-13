// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: magic;
function loadFile (path) {
    try { var fm = FileManager.iCloud() } catch (e) { var fm = FileManager.local() }
    let code = fm.readString(fm.joinPath(fm.documentsDirectory(), path))
    if (code == null) throw new Error(`Module '${path}' not found.`)
    return Function(`${code}; return exports`)()
  }
const credentials = loadFile('Intervals.js');

// Evaluate First Parameter
// 1 = Distance, 2 = Load, 3 = Work, 4 = Moving Time
let metricParam = parseInt(args.widgetParameter?.split(",")[0]); // First Parameter: metric
metricParam = isNaN(metricParam) ? 1 : metricParam; // default 1 (distance)

// Calculate the Monday of the specified week based on the parameter
let weekParam = parseInt(args.widgetParameter?.split(",")[1]); // Second Parameter: week
weekParam = isNaN(weekParam) ? 0 : weekParam; // default 0 (this week)

// Calculation of the Monday for the desired week
let today = new Date();
let currentDay = today.getDay(); // Sunday = 0, Monday = 1, ...
let daysSinceMonday = (currentDay === 0 ? 6 : currentDay - 1); // For Sunday, go back 6 days
let monday = new Date(today);
monday.setDate(today.getDate() - daysSinceMonday - weekParam * 7); // Go back 'weekParam' weeks
monday.setHours(0, 0, 0, 0);

// Local date for the Monday and Sunday of the desired week
let localMonday = new Date(monday.getTime() - monday.getTimezoneOffset() * 60000)
  .toISOString()
  .split('T')[0];

let sunday = new Date(monday);
sunday.setDate(monday.getDate() + 6);
let localSunday = new Date(sunday.getTime() - sunday.getTimezoneOffset() * 60000)
  .toISOString()
  .split('T')[0];

const apiUrl = `https://intervals.icu/api/v1/athlete/${credentials.userID}/activities?oldest=${localMonday}&newest=${localSunday}`;
const authHeader = "Basic " + btoa("API_KEY" + ":" + credentials.apiPassword);

// Function to retrieve all activities for the specified week
async function getWeekActivities() {
  let req = new Request(apiUrl);
  req.headers = { "Authorization": authHeader };

  let response = await req.loadJSON();
  return response;
}

// Function to calculate the desired metric for each day of the week
function calculateDailyMetrics(activities, metric) {
  let dailyMetrics = new Array(7).fill(0); // Array for the days of the week (Monday to Sunday)

  activities.forEach(activity => {
    let activityDate = new Date(activity.start_date_local);
    let dayIndex = (activityDate.getDay() === 0 ? 6 : activityDate.getDay() - 1); // Monday = 0, ..., Sunday = 6

    // Select metric
    switch (metric) {
      case 1: // Distance (km)
        dailyMetrics[dayIndex] += activity.distance / 1000; // Distance in km
        break;
      case 2: // Load (TSS)
        dailyMetrics[dayIndex] += activity.icu_training_load ?? 0; // Training load
        break;
      case 3: // Work (kJ)
        dailyMetrics[dayIndex] += activity.icu_joules / 1000 ?? 0; // Work (kJ)
        break;
      case 4: // Moving Time (minutes)
        dailyMetrics[dayIndex] += activity.moving_time / 60 ?? 0; // Moving time in minutes
        break;
      default:
        dailyMetrics[dayIndex] += activity.distance / 1000; // Default: Distance
    }
  });

  return dailyMetrics;
}

// Function to create the widget
async function createWidget() {
  let activities = await getWeekActivities();
  let dailyMetrics = calculateDailyMetrics(activities, metricParam);
  let totalMetric = dailyMetrics.reduce((sum, metric) => sum + metric, 0); // Total value for the week

  let widget = new ListWidget();

  // Add title with total value
  let metricTitle = 
    metricParam === 1 ? "Distance" : 
    metricParam === 2 ? "Load" : 
    metricParam === 3 ? "Work (kJ)" : 
    "Moving Time (min)";
  let header = widget.addText(`Weekly ${metricTitle}: ${Math.round(totalMetric)} ${metricParam === 1 ? "km" : metricParam === 3 ? "kJ" : metricParam === 4 ? "min" : ""}`);
  header.font = Font.boldSystemFont(12);
  header.centerAlignText();

  widget.addSpacer(10);

  const width = 300;
  const height = 110;
  const spacing = 3;
  const topSpacing = 25;
  const cornerRadius = 4;
  const maxMetric = Math.max(...dailyMetrics); // Maximum metric for scaling

  const container = widget.addStack();
  container.bottomAlignContent();
  container.size = new Size(width, height);
  container.layoutHorizontally();
  container.spacing = spacing;

  // Define the weekdays
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];

  // Draw bars and add values
  dailyMetrics.forEach((metric, index) => {
    let barStack = container.addStack();
    barStack.layoutVertically();

    let bar = barStack.addStack();
    bar.backgroundColor = new Color("#FFA500"); // Orange for all bars
    bar.cornerRadius = cornerRadius;
    bar.size = new Size(
      (width - dailyMetrics.length * spacing) / dailyMetrics.length,
      ((height - topSpacing) / maxMetric) * metric
    );

    barStack.addSpacer(2);

    // First row: Value without decimals
    let metricLabel = barStack.addText(`${Math.round(metric)}`);
    metricLabel.font = Font.systemFont(8);
    metricLabel.leftAlignText();

    // Second row: Initial letter of the weekday (bold)
    let dayLabel = barStack.addText(`${weekDays[index]}`);
    dayLabel.font = Font.boldSystemFont(8);
    dayLabel.centerAlignText();
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
