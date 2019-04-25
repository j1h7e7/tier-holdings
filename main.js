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

	var collegename = document.getElementById("collegeSearch").value;
	var majorsElem =document.getElementById("majors") 
	var testmajor = majorsElem.options[majorsElem.selectedIndex].value;
	var testMajorFormatted = majorsElem.options[majorsElem.selectedIndex].text;
	var url = "https://api.data.gov/ed/collegescorecard/v1/schools?school.name={0}&api_key=pjocLbVezV0ADpMYlUBYtNJYt4ObWiXtFiGgvnDr";

	var webdata = JSON.parse(loadFile("https://api.data.gov/ed/collegescorecard/v1/schools?school.name=" + 
	(collegename.replace(/ /g,"%20")) + "&api_key=pjocLbVezV0ADpMYlUBYtNJYt4ObWiXtFiGgvnDr"))['results'][0]['latest'];

	var earnings = webdata['earnings'];
	var majorratios = webdata['academics']['program_percentage'];

	var completion = webdata['completion'];
	var gradrate = completion['completion_rate_4yr_200nt'];

	var idealavg = 0;
	for(var major in majorratios){
		try{idealavg += majorratios[major]*majorearningdata[major];}
		catch(err){}
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

	document.getElementById('output').innerHTML = "A " + testMajorFormatted + " major at " + collegename 
	+ " would make $" + Math.round(scalefactor*majorearningdata[testmajor],2) + ".";

}

$(document).ready(function() {
	$( function() {
		var collegeList = loadFile("collegelist.txt").split("\n");
		$( "#collegeSearch" ).autocomplete({
			source: collegeList
		}, "option", "position", { my: "center top", at: "center bottom"});
	} );
});

$(document).ready(function () {
	$('#collegeForm').on('submit', function(e) {
			console.log("submitted")
			e.preventDefault();
			getIncome();
	});
});
