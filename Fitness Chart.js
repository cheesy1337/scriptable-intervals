// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: green; icon-glyph: magic;
const athleteID = "userid";
const API_KEY = "apikey";

const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");
const formattedToday = `${year}-${month}-${day}`;

const pastDate = new Date();
pastDate.setDate(today.getDate() - 20);
const pastYear = pastDate.getFullYear();
const pastMonth = String(pastDate.getMonth() + 1).padStart(2, "0");
const pastDay = String(pastDate.getDate()).padStart(2, "0");
const formattedPastDate = `${pastYear}-${pastMonth}-${pastDay}`;

// Function to fetch wellness data from the API
const getData = async () => {
  const url = `https://intervals.icu/api/v1/athlete/${athleteID}/wellness?oldest=${formattedPastDate}&newest=${formattedToday}`;
  const req = await new Request(url);
  const auth = btoa(`API_KEY:${API_KEY}`);
  req.headers = {
    Authorization: `Basic ${auth}`,
  };
  const res = await req.loadJSON();
  return res; // Return the fetched data
};

// Function to determine the color based on form value
function getFormColor(val) {
  console.log(val);
  if (val > 20) 
    textColor = '##e4ae00'; // Gold
  else if (val <= 20 && val > 5) 
    textColor = '#34ace4'; // Light Blue
  else if (val <= 5 && val > -10) 
    textColor = '#999999'; // Gray
  else if (val <= -10 && val > -30) 
    textColor = '#33cc4c'; // Green
  else if (val <= -30) 
    textColor = '#dd0000'; // Red
  else 
    textColor = '#aaaaaa'; // Default Gray
  
  return textColor;
}

// Function to generate and display the chart
const getChart = async () => {
  const data = await getData();
  const labels = []; // Labels for the X-axis
  const ctls = []; // Fitness data
  const atls = []; // Fatigue data
  const forms = []; // Form data

  // Process the fetched data to populate labels and datasets
  data.forEach((item) => {
    labels.push(item.id.slice(5)); // Extract and format the label (e.g., MM-DD)
    ctls.push(item.ctl.toFixed(0)); // Add fitness (CTL)
    atls.push(item.atl.toFixed(0)); // Add fatigue (ATL)
    forms.push((item.ctl - item.atl).toFixed(0)); // Calculate form (CTL - ATL)
  });

  // Identify today's data
  const today = data.find(item => item.id === formattedToday) || data[data.length - 1];

  // Define chart configuration
  const charts = {
    type: "line",
    data: {
      labels: labels, // Labels for the X-axis
      datasets: [
        {
          label: "Fitness", // Fitness (CTL) dataset
          data: ctls,
          fill: false,
          borderColor: "#34ace4", // Light Blue
          lineTension: 0.2,
          yAxisID: 'y1',
          pointRadius: 0,
          borderWidth: 2,
        },
        {
          label: "Fatigue", // Fatigue (ATL) dataset
          data: atls,
          fill: false,
          borderColor: "#6633cc", // Purple
          lineTension: 0.2,
          yAxisID: 'y1',
          pointRadius: 0,
          borderWidth: 1,
        },
        {
          label: "Form", // Form dataset
          data: forms,
          fill: false,
          borderColor: getFormColor(today.ctl - today.atl), // Dynamic color based on form value
          lineTension: 0.2,
          yAxisID: 'y2',
          pointRadius: 0,
          borderWidth: 1,
        },
      ],
    },
    options: {
      legend: {
        labels: {
          fontSize: 10, // Font size for the legend
        },
      },
      scales: {
        yAxes: [
          {
            id: 'y1', // Primary Y-axis (Fitness and Fatigue)
            display: 'true',
            position: 'left',
          },
          {
            id: 'y2', // Secondary Y-axis (Form)
            display: 'true',
            position: 'right',
            gridLines: {
              display: false,
              drawTicks: false,
            },
          },
        ],
      },
    },
  };

  const url = "https://quickchart.io/chart";

  const request = new Request(url);
  request.method = "POST";
  request.headers = { "Content-Type": "application/json" };
  request.body = JSON.stringify({
    width: 350,
    height: 350,
    chart: charts,
  });

  try {
    const imageData = await request.loadImage();

    const widget = new ListWidget();

    const stack = widget.addStack();
    stack.layoutVertically();

    const imageWidget = stack.addImage(imageData);

    imageWidget.imageSize = new Size(320, 300); // Set chart image size
    imageWidget.centerAlignImage();

    const textStack = stack.addStack();
    textStack.layoutHorizontally();

    textStack.addSpacer();

    // Add today's CTL (Fitness), ATL (Fatigue), and Form data below the chart
    const text1 = textStack.addText(`${today.id} Fitness: `);
    text1.font = Font.systemFont(10);
    text1.textColor = Color.gray();

    const text2 = textStack.addText(`${today.ctl.toFixed(0)}`);
    text2.font = Font.systemFont(10);
    text2.textColor = new Color('#34ace4'); // Fitness color

    const text3 = textStack.addText('. Fatigue: ');
    text3.font = Font.systemFont(10);
    text3.textColor = Color.gray();

    const text4 = textStack.addText(`${today.atl.toFixed(0)}`);
    text4.font = Font.systemFont(10);
    text4.textColor = new Color('#6633cc'); // Fatigue color

    const text5 = textStack.addText('. Form: ');
    text5.font = Font.systemFont(10);
    text5.textColor = Color.gray();

    const text6 = textStack.addText(`${(today.ctl - today.atl).toFixed(0)}`);
    text6.font = Font.systemFont(10);
    const val = today.ctl - today.atl;
    text6.textColor = new Color(getFormColor(val)); // Dynamic form color

    textStack.addSpacer();

    // Present the widget
    Script.setWidget(widget);
    widget.presentLarge();
  } catch (error) {
    console.error(error); // Log any errors
  }
};

// Generate and display the chart
getChart();
