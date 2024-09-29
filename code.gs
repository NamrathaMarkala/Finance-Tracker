const SETTINGS_SHEET = "Settings";
const ENTRY_CAT_RANGE = "A2:B";
const PAYMENT_METHOD_RANGE = "D2:D";
const DATA_SHEET = "Data";
const INCOME_DATA_SHEET = "Income";
const INCOME_RANGE = "A1:H"
const EXPENDITURE_DATA_SHEET = "Expenditure";
const EXPENDITURE_RANGE = "A1:H";

/**
 * CREATE CUSTOM MENU IN GOOGLE SHEETS MENU BAR
 */
function onOpen() { 
  let ui = SpreadsheetApp.getUi();
  ui.createMenu("My Menu")
    .addItem("Sidebar Form","showFormInSidebar")
    .addToUi();
}

/**
 * CREATE HTML WEB APP
 */
function doGet(){
  let template = HtmlService.createTemplateFromFile('WebApp');
  let html = template.evaluate().setTitle('My Budget');
  
  html.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  html.addMetaTag('viewport', 'width=device-width, initial-scale=1');
  
  return html;
}


/**
 * OPEN THE FORM IN SIDEBAR 
 */
function showFormInSidebar() {      
  let form = HtmlService.createTemplateFromFile('Sidebar').evaluate().setTitle('My Budget');
  SpreadsheetApp.getUi().showSidebar(form);
}


/**
 * PROCESS THE formObject RETURNED FORM SIDEBAR FORM
*/
function processForm(formObject){ 
  let sheet = SpreadsheetApp.getActive().getSheetByName(DATA_SHEET);
  if(formObject.entryType=="income"){
    sheet.appendRow([
                new Date().toLocaleString(),
                formObject.entryType,
                formObject.entryCategory,
                formObject.paymentMethod,
                formObject.transactionDate,
                formObject.description,
                Number (formObject.amount),
                ,
                formObject.remarks
                //Add your new field names here
                ]);
  }else if(formObject.entryType=="expenditure"){
    sheet.appendRow([
                new Date().toLocaleString(),
                formObject.entryType,
                formObject.entryCategory,
                formObject.paymentMethod,
                formObject.transactionDate,
                formObject.description,
                ,
                Number (formObject.amount),
                formObject.remarks
                //Add your new field names here
                ]);
  }
}


/**
 * GET INPUT CATEGORIES FOR THE "Entry Category" DROPDOWN
 */
function getInputCategories(){
  const entryCategories = readDataFromSheets(SETTINGS_SHEET,ENTRY_CAT_RANGE);
  const filteredEntryCategories = filterData(entryCategories);
  return filteredEntryCategories;
}

/**
 * GET PAYMENT METHODS FOR THE "Payment Method" DROPDOWN LIST
 */
function getPaymentMethods(){
  const entryCategories = readDataFromSheets(SETTINGS_SHEET,PAYMENT_METHOD_RANGE);
  const filteredPaymentMethods = filterData(entryCategories);
  return filteredPaymentMethods;
}

/**
 * GET THE SUM OF INCOME AND EXPENDITURE FOR THE CURRENT MONTH TO DRAW A PIE CHART
 */
function getCurrentMonthIncomeAndExpenditure(){
  const currentMonthIncome = getDataForCurrentMonth(INCOME_DATA_SHEET,INCOME_RANGE);
  const currentMonthExpenditure = getDataForCurrentMonth(EXPENDITURE_DATA_SHEET,EXPENDITURE_RANGE);
  currentMonthIncome.shift();
  currentMonthExpenditure.shift();
  let groupedIncomeAndExpenditure = groupData([...currentMonthIncome,...currentMonthExpenditure],1,6);
  groupedIncomeAndExpenditure.unshift(['Entry Type','Amount']);
  return groupedIncomeAndExpenditure;
}

function getCurrentMonthExpenditureByCategory(){
  const currentMonthExpenditure = getDataForCurrentMonth(EXPENDITURE_DATA_SHEET,EXPENDITURE_RANGE);
  currentMonthExpenditure.shift();
  groupedExpenditure = groupData(currentMonthExpenditure,2,6);
  groupedExpenditure.unshift(['Category','Amount']);
  Logger.log(groupedExpenditure);
  return groupedExpenditure;
}

function getCurrentMonthIncomeByCategory(){
  const currentMonthIncome = getDataForCurrentMonth(INCOME_DATA_SHEET,INCOME_RANGE);
  currentMonthIncome.shift();
  groupedIncome = groupData(currentMonthIncome,2,6);
  groupedIncome.unshift(['Category','Amount']);
  Logger.log(groupedIncome);
  return groupedIncome;
}

function groupData(data,keyCol,valCol){
  var groupedData = data.reduce(function(acc, row) {
    var key = row[keyCol];
    var value = row[valCol];

    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key] += value;

    return acc;
  }, {});

  var result = Object.keys(groupedData).map(function(key) {
    return [key, groupedData[key]];
  });
  return result;
}


/**
 * READ THE DATA FROM GOOGLE SHEETS
*/
function readDataFromSheets(sheetsName,dataRange){
  const ss = SpreadsheetApp.getActive().getSheetByName(sheetsName);
  const range = ss.getRange(dataRange);
  const values = range.getValues();
  return values;
}



/**
 * REMOVE EMPTY ROWS iN THE DATA RANGE. 
 * ALSO CONVERT DATE TO STRING, THE CODE WILL NOT WORK OTHERWISE.
 */
function filterData(data) {
  const filteredData = data.filter(row => row.some(cell => cell !== "" || cell instanceof Date));
  const formattedData = filteredData.map(row => row.map(cell => {
    if (cell instanceof Date) {
      return cell.toLocaleDateString();
    }
    return cell;
  }));
  return formattedData;
}



/**
 * GET THE DATA FOR THE CURRENT MONTH OF THE CURRENT YEAR
 */

function getDataForCurrentMonth(sheetName, dataRange) {
  let data = readDataFromSheets(sheetName,dataRange);
  let headerRow = data[0];
  
  let currentDate = new Date();
  let currentMonth = currentDate.getMonth() + 1; // Adding 1 to get the current month (January is 0)
  let currentYear = currentDate.getFullYear(); // Get the current year
  
  let filteredData = data.filter(function(row) {
    let date = row[0]; // Assuming the date column is the first column, modify accordingly if different
    if (date instanceof Date) {
      let month = date.getMonth() + 1; // Adding 1 to get the month (January is 0)
      let year = date.getFullYear(); // Get the year of the date
      
      return month === currentMonth && year === currentYear;
    }
    return false;
  });
  filteredData.unshift(headerRow);
  return filteredData;
}


/**
 * INCLUDE HTML PARTS, EG. JAVASCRIPT, CSS, OTHER HTML FILES
 */

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
