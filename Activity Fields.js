// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: bicycle;
// Importiere die Bibliotheken

// Füge deine Basic Authorization Anmeldedaten hier ein
const userID = "userid";
const apiPassword = "apikey";

// Calculate the date one week ago
let date = new Date();
date.setDate(date.getDate() - 7);
let oldestDate = date.toISOString().split('T')[0];

// API URL with dynamic "oldest" parameter
const apiUrl = `https://intervals.icu/api/v1/athlete/${userID}/activities?oldest=${oldestDate}`;

const authHeader = "Basic " + btoa("API_KEY" + ":" + apiPassword);

// Function to fetch the last activity
async function getLastActivity() {
  let req = new Request(apiUrl);
  req.headers = { "Authorization": authHeader };
  
  let response = await req.loadJSON();
  return response[0]; // Return the first activity from the response
}

// Function to format time in hours, minutes, and seconds
function formatTime(seconds) {
  let hours = Math.floor(seconds / 3600);
  let minutes = Math.floor((seconds % 3600) / 60);
  let secs = seconds % 60;

  // Dynamic format depending on the presence of hours
  return hours > 0 
    ? `${hours}h${minutes}m${secs}s`
    : `${minutes}m${secs}s`;
}

// Function to create the widget
async function createWidget() {
  let activity = await getLastActivity();

  let widget = new ListWidget();

  if (activity) {
    // Activity name
    let name = widget.addText(`${activity.name}`);
    name.font = Font.boldSystemFont(16);
    name.centerAlignText();

    widget.addSpacer(5);
    
    // Arrange data fields in three columns
    let dataStack = widget.addStack();
    dataStack.layoutHorizontally();
    dataStack.spacing = 5;

    // First column
    let col1 = dataStack.addStack();
    col1.layoutVertically();
    col1.addText(`📅 ${activity.start_date_local.split('T')[0]}`).font = Font.systemFont(12); // Date
    col1.addSpacer(4);
    col1.addText(`🕒 ${activity.start_date_local.split('T')[1].slice(0, 5)}`).font = Font.systemFont(12); // Time
    col1.addSpacer(4); 

    col1.addText(`⏳ ${formatTime(activity.elapsed_time)}`).font = Font.systemFont(12); // Elapsed Time
    col1.addSpacer(4);
    col1.addText(`⏱️ ${formatTime(activity.moving_time)}`).font = Font.systemFont(12); // Moving Time
    col1.addSpacer(4);

    col1.addText(`↔️ ${(activity.distance / 1000).toFixed(2)} km`).font = Font.systemFont(12); // Distance
    col1.addSpacer(4);
    col1.addText(`🧗‍♂️ ${(activity.total_elevation_gain ?? 0).toFixed(0)} m`).font = Font.systemFont(12); // Elevation Gain
    col1.addSpacer(4);
    col1.addText(`🚴 ${(activity.distance / activity.moving_time * 3.6).toFixed(1)} km/h`).font = Font.systemFont(12); // Average Speed

    dataStack.addSpacer();

    // Second column
    let col2 = dataStack.addStack();
    col2.layoutVertically();
    col2.addText(`📈 ${parseInt(activity.icu_intensity).toFixed(0)} %`).font = Font.systemFont(12); // Intensity
    col2.addSpacer(4);
    col2.addText(`🔋 ${activity.icu_training_load} TSS`).font = Font.systemFont(12); // Load
    col2.addSpacer(4);
    
    col2.addText(`🌬️ ${formatTime(activity.coasting_time)}`).font = Font.systemFont(12); // Coasting Time
    col2.addSpacer(4);
    col2.addText(`🎯 ${activity.average_cadence.toFixed(0)} rpm`).font = Font.systemFont(12); // Cadence
    col2.addSpacer(4);
    col2.addText(`⚡️ ${activity.icu_pm_ftp} W`).font = Font.systemFont(12); // Ride eFTP
    col2.addSpacer(4);
    col2.addText(`🔨 ${(activity.icu_joules / 1000).toFixed(0)} kJ`).font = Font.systemFont(12); // Work
    col2.addSpacer(4);
    col2.addText(`📊 ${activity.icu_variability_index.toFixed(2)}`).font = Font.systemFont(12); // Variability Index

    dataStack.addSpacer();

    // Third column
    let col3 = dataStack.addStack();
    col3.layoutVertically();
    col3.addText(`❤️ ${activity.average_heartrate} bpm`).font = Font.systemFont(12); // Average Heart Rate
    col3.addSpacer(4);
    col3.addText(`❤️‍🔥 ${activity.max_heartrate} bpm`).font = Font.systemFont(12); // Max Heart Rate
    col3.addSpacer(4);

    let hrrc = "-";
    if (activity.icu_hrr != null) {
      hrrc = activity.icu_hrr.hrr.toString();
    }
    col3.addText(`🕳️ ${hrrc} b`).font = Font.systemFont(12); // HRRc
    col3.addSpacer(4);
    col3.addText(`⚡️ ${activity.icu_average_watts} W`).font = Font.systemFont(12); // Average Power
    col3.addSpacer(4);
    col3.addText(`⚡️ ${activity.icu_weighted_avg_watts} NP`).font = Font.systemFont(12); // NP
    col3.addSpacer(4);
    col3.addText(`💙 ${(activity.icu_power_hr).toFixed(2)} W/bpm`).font = Font.systemFont(12); // Power-to-HR ratio
    col3.addSpacer(4);
    col3.addText(`⚙️ ${activity.icu_efficiency_factor.toFixed(2)} NP/bpm`).font = Font.systemFont(12); // Efficiency Factor
  } else {
    widget.addText("No activity found.");
  }

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
