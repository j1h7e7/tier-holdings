function loadFile(filePath) {
	var result = null;
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", filePath, false);
	xmlhttp.send();
	if (xmlhttp.status==200) {
		result = xmlhttp.responseText;
	}
	return result;
}

function getIncome(){
  majorearningdata = JSON.parse(loadFile("majordata.json"));
  rawdropoutdata = JSON.parse(loadFile("dropoutdata.json"));
  majordropoutdata = {};
  for(major in rawdropoutdata){
    majordropoutdata[major] = 1-rawdropoutdata[major]/100;
  }
  

	var collegename = document.getElementById("collegeSearch").value;
	var majorsElem =document.getElementById("majors") 
	var testmajor = majorsElem.options[majorsElem.selectedIndex].value;
	var testMajorFormatted = majorsElem.options[majorsElem.selectedIndex].text;
	var url = "https://api.data.gov/ed/collegescorecard/v1/schools?school.name={0}&api_key=pjocLbVezV0ADpMYlUBYtNJYt4ObWiXtFiGgvnDr";

  try{
    var webdata = JSON.parse(loadFile("https://api.data.gov/ed/collegescorecard/v1/schools?school.name=" + 
    (collegename.replace(/ /g,"%20")) + "&api_key=pjocLbVezV0ADpMYlUBYtNJYt4ObWiXtFiGgvnDr"))['results'][0]['latest'];
  }
  catch(err){
    processingerror()
    return
  }

	var earnings = webdata['earnings'];
	var majorratios = webdata['academics']['program_percentage'];

	var completion = webdata['completion'];
	var gradrate = completion['completion_rate_4yr_200nt'];

  var idealavg = 0;
  var idealdrop = 0;
	for(var major in majorratios){
		try{
      idealavg += majorratios[major]*majorearningdata[major];
      idealdrop += majorratios[major]*majordropoutdata[major];
    }
		catch(err){
      console.log("Error getting major data for "+major+".")
    }
	}

	var avgdata= {}

	for(var year in earnings){
		try{if(earnings[year].length<2){continue;}}
		catch(err){continue;}

		try{avgdata[year] = parseInt(earnings[year]['mean_earnings']);} // Look for a mean earnings entry
		catch(err){avgdata[year] = 0;}
		if (avgdata[year]>0){continue;}

		try{avgdata[year] = parseInt(earnings[year]['mean_earnings']['middle_tercile']);} // Look for a mean earnings/middle tercile entry
		catch(err){avgdata[year]=0;}
		if (avgdata[year]>0){continue;}

		try{avgdata[year] = parseInt(earnings[year]['median']);} // Look for a mean earnings/middle tercile entry
		catch(err){avgdata[year]=0;}
		if (avgdata[year]>0){continue;}
	}
	//avgdata =  $.map(avgdata, function(value, key) {return value;});

	var sum = 0;
	var len = 0;
	for(var key in avgdata){
		if(avgdata[key]>0){
			sum+=avgdata[key];
			len++;
		}
	}

  var scalefactor = (sum/len)/idealavg;
  var dropsf = (1-gradrate)/idealdrop;

  console.log(idealdrop)

  var finalearnings = (scalefactor*majorearningdata[testmajor]+sum/len)/2
  var finalgradrate = 1-dropsf*majordropoutdata[testmajor]

  if(finalgradrate<0.5){
    finalgradrate = 1/(1+Math.pow(Math.E,(-5*(finalgradrate-0.5))))
  }

  var finalrating = finalgradrate / (1 + Math.pow(Math.E,(50-(finalearnings/1000))/10));

  // Error checks:
  if(finalrating<0||finalgradrate<0||isNaN(finalearnings)||isNaN(finalrating)||isNaN(finalgradrate)){
    processingerror()
    return
  }

	document.getElementById('output').innerHTML = "A " + testMajorFormatted + " major at " + collegename 
  + " would make $" + Math.round(finalearnings,2) + ", and would have a graduation rate of "
  + parseFloat(finalgradrate*100).toFixed(2)+"%." + "<br>"
  document.getElementById('finalratingtext').innerHTML = "Final Rating: "
  document.getElementById('rating').innerHTML = parseFloat(finalrating*100).toFixed(2)+"%";

  var red = 255-Math.max(0,finalrating-0.5)*510
  var green = 0+Math.min(0.5,finalrating)*510
  var rgb = Math.floor(red)*256*256+Math.floor(green)*256
  var colorstring = "000000"+rgb.toString(16)
  colorstring = colorstring.substr(colorstring.length-6)
  document.getElementById('rating').style.color = "#"+colorstring

}

function processingerror() {
  document.getElementById('output').innerHTML = "There has been an error or there is not enough data for the selected school."
  + " Please try again or change the school or major."
  document.getElementById('finalratingtext').innerHTML = ""
  document.getElementById('rating').innerHTML = ""
}

$(document).ready(function() {
	$( function() {
    var collegeList = loadFile("collegelist.txt").split("\n");
		$( "#collegeSearch" ).autocomplete({
			source: collegeList
		});
	} );
});

$(document).ready(function () {
	$('#collegeForm').on('submit', function(e) {
			//console.log("submitted")
			e.preventDefault();
			getIncome();
	});
});
