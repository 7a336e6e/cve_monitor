function getCVEs() 
{
  // add timezone manually or even better use Timezone IDs: https://developers.google.com/google-ads/api/reference/data/codes-formats#expandable-21
  var today = Utilities.formatDate(new Date(), "Etc/GMT", "yyyy-MM-dd")
  var current_year = new Date()
  var url = `https://api.github.com/search/repositories?q=CVE-${current_year.getFullYear()}+created:${today}&sort=updated&order=desc&per_page=1000`
  const cves = UrlFetchApp.fetch(url)
  const repos = JSON.parse(cves.getContentText())['items']
  var cve_list = []
  var cve = {}

  repos.forEach(function(elem) {
    cve = {}
    var regExp = new RegExp('CVE-\\d{4}-\\d{4,7}', 'gi')
    cve['name'] = regExp.exec(elem['name'])
    if (cve['name'] == null)
    {
      cve['name'] = checkDescription(elem['description'])
    }
    cve['id'] = elem['id']
    cve['poc'] = elem['html_url']
    cve['poc_owner'] = elem['owner']['login']
    cve['created_at'] = elem['created_at']
    var check_status = checkSaved(cve)
    if (check_status == true)
    {
      var result = checkCVE(cve)
      if (result['is_cve'] == true)
      {
        cve['is_cve'] = true
        cve['description'] = result['description']
        sendMessage(cve)
        saveCVE(cve, true)
      }
      else
      {
        cve['is_cve'] = false
        saveCVE(cve, false)
      }
      cve_list.push(cve)

    }
  })
}

function checkDescription(text)
{
    var regExp = new RegExp('CVE-\\d{4}-\\d{4,7}', 'gi')
    var reg_result = regExp.exec(text)
    return reg_result
}

function checkSaved(cve)
{
  // get spreadsheet id from link: https://docs.google.com/spreadsheets/d/SPREADSHEED_ID_HERE/edit#gid=0
  var ss = SpreadsheetApp.openById('SPREADSHEET_ID_HERE');
  var searchString = cve["id"]
  var sheet = ss.getSheetByName("SHEET_NAME_HERE")
  var data=sheet.getDataRange().getValues();
  var searchResult = 0
  for (var i = 1; i<data.length; i++)
  {
    if(data[i][0] == searchString)
    {
      searchResult = -1
    }
  }

  if(searchResult == -1)
  {
    return false
  }
  else
  {
    return true
  }
}

function checkCVE(cve)
{
  // sleep 5 seconds in case there are multiple CVEs - don't want to spam NIST :)
  Utilities.sleep(5*1000)
  var result = {}
  result['is_cve'] = false
  try
  {
    console.log(`Checking NVD for CVE ${cve["name"]} for ID ${cve["id"]}`)
    const cve_url = UrlFetchApp.fetch(`https://services.nvd.nist.gov/rest/json/cve/1.0/${cve["name"]}?addOns=dictionaryCpes`)

    if(cve_url.getResponseCode() != 404)
    {
      console.log(`Found CVE ${cve["name"]}`)
      const nvd_cve = JSON.parse(cve_url.getContentText())
      const totalResults = nvd_cve['totalResults']
      if(totalResults == 1)
      {
        result['description'] = nvd_cve['result']['CVE_Items'][0]['cve']['description']['description_data'][0]['value']
        result['is_cve'] = true
      }
    }
  }
  catch (err)
  {
    console.log(`Encountered error trying to retrieve CVE: ${cve["name"]} -- ${err.message}`)
  }

  return result

}

function saveCVE(cve, message_sent)
{
  var row = 
  [
    cve['id'], cve['poc'], cve['created_at'], cve['poc_owner'], message_sent
  ]

  // get spreadsheet id from link: https://docs.google.com/spreadsheets/d/SPREADSHEED_ID_HERE/edit#gid=0
  var ss = SpreadsheetApp.openById('SPREADSHEET_ID_HERE');
  var sheet = ss.getSheetByName("SHEET_NAME_HERE")
  try 
  {
    sheet.appendRow(row)
  } 
  catch (err) 
  {
    console.log(`Encountered an error trying to save CVE ${cve["id"]} in excel -- ${err.message}`)
  }

}

function sendMessage(cve)
{
  message = `CVE PoC Found ${cve["name"]} - ${cve["poc"]}\n\n${cve["description"]}\n\n`;

  var discordUrl = 'DISCORD_WEBHOOK';
  var slackURL = 'SLACK_WEBHOOK'
  var payload = JSON.stringify({content: message});

  var params = {
    headers: {
      'Content-Type': 'application/json'
    },
    method: "POST",
    payload: payload,
    muteHttpExceptions: true
  };

  var slackMessage = {
    text: message,
    username: 'USERNAME_HERE',
  }

  const options = {
    method:'POST',
    contentType: 'application/json',
    payload: JSON.stringify(slackMessage)
  }

  var response_discord = UrlFetchApp.fetch(discordUrl, params);
  var response_slack = UrlFetchApp.fetch(slackURL, options)
}
