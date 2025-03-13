# scriptable-intervals

## Setup
Copy these js files in the iOS Cloud Scriptable Folder. Important: Change your User ID and API Key in the "Intervals.js" file. You find these in the settings page of intervals.icu. 
The "Intervals.js" file should look something like this (Note: This are of course fake credentials):

![credentials](https://github.com/user-attachments/assets/20a48cb2-a248-4702-a377-6e6433638eb2)

## Activity Fields Big
This Widget shows a bunch of data (in sum 18 fields) of the last activity. 

![IMG_1604](https://github.com/user-attachments/assets/32729226-782b-4107-a649-9743890e14c1)


## Activity Fields
This is the same as Activity Fields Big, but it shows only 6 Fields in a Medium Widget. 

![IMG_1605](https://github.com/user-attachments/assets/1cfc3836-5dee-44c2-905f-12586fe664ac)

### Parameters
If you set the argument (Parameter) of the widget to "1" you get HR Data. If you use "0" you get Power Data. If you leave it blank, you got the times and speed and so on as shown in the screenshot. 


## Activity Histogram
This shows the power or hr histogram of the last activity. 

![IMG_1607](https://github.com/user-attachments/assets/d2ed8808-dd44-47ec-a326-6e59ad66baf3)

### Parameters
If you set the argument (Parameter) of the widget to "2" you get HR Data. If you use "1" or leave it blank you get Power Data. 
You can change the variable minBucket in the script to show only buckets bigger than this value (for example to exclude 0W Buckets).


## Activity TiZ
This shows the Power or HR Time in Zones of the last activity. 

![IMG_1608](https://github.com/user-attachments/assets/f9e402cb-6f5e-41cb-a18e-67c293a9655f)

### Parameters
If you set the argument (Parameter) of the widget to "2" you get HR Time in Zones. If you use "1" or leave it blank you get Power Time in Zones. 

## Fitness Chart
This shows the fitness chart. The Form curve is coloured depending on your todays value. 

![IMG_1609](https://github.com/user-attachments/assets/64e6c6c6-ec60-4e9c-a488-01d136ed587f)

## Power Curve
This shows the power duration curve of the last activity in dark purple, and the power duration curve of the last 42 days. 

![IMG_1610](https://github.com/user-attachments/assets/fd956edc-d553-4b55-b8a3-629f18c2928a)


## Totals To Date
This shows the Totals from the beginning of the current year until today. 

![IMG_1611](https://github.com/user-attachments/assets/0911363c-60e0-40bf-89e2-2ea0d2926a4e)

### Parameters
If you set the Parameter to "1", it will show the Totals from the beginning of last year until the same date as today of last year. If you set it to "2" it will be the year before and so on. 

## Totals Weekly
This shows the Totals of the current week. You can show distance, load, moving time and total work.  

![IMG_1612](https://github.com/user-attachments/assets/da2e50f2-4bf0-48ff-8af7-7bf11ff1e6f5)

### Parameters
If you set the Parameter to "1", it will show the Weekly distance.
If you set the Parameter to "2", it will show the Weekly Load.
If you set the Parameter to "3", it will show the Weekly Work.
If you set the Parameter to "4", it will show the Weekly Moving Time.
If you add a second parameter (e.g. "2,1") it will show the the Load of the week before. 

## Totals Year
This shows the Totals from last year. 

![IMG_1613](https://github.com/user-attachments/assets/38399574-3a49-4d29-81ca-300fd077926a)

### Parameters
If you set the Parameter to "1", it will show the Totals from the year before last year, and so on. 
