javascript:
//FUNCTIONS

//"logic" functions

/*Functions used to obtain some data*/

//download the time window from a given url
function getArrivalDate(url){
    var request = new XMLHttpRequest();
    request.open('GET', url, false);
    request.send(null);
	dates=request.response.split(';');
	min=dates[0].split(':');
	max=dates[1].split(':');
	min_time=new Date(parseInt(min[0]),parseInt(min[1])-1,parseInt(min[2]),parseInt(min[3]),parseInt(min[4]),parseInt(min[5]),parseInt(min[6]));
	max_time=new Date(parseInt(max[0]),parseInt(max[1])-1,parseInt(max[2]),parseInt(max[3]),parseInt(max[4]),parseInt(max[5]),parseInt(max[6]));
	arrival=[min_time,max_time];
	return arrival;
}

//read a text file uploaded somewhere 
function getCoordsByUrl(url){
    var request = new XMLHttpRequest();
    request.open('GET', url, false);
    request.send(null);
	return request.response;
}

//get unit infos (speed and pop)
function fnAjaxRequest(url,sendMethod,params,type){
    var error=null,payload=null;
 
    win.$.ajax({
        "async":false,
        "url":url,
        "data":params,
        "dataType":type,
        "type":String(sendMethod||"GET").toUpperCase(),
        "error":function(req,status,err){error="ajax: " + status;},
        "success":function(data,status,req){payload=data;}
    });
 
    if(error){
        throw(error);
    }
 
    return payload;
}
function fnCreateConfig(name){return win.$(fnAjaxRequest("/interface.php","GET",{"func":name},"xml")).find("config");}
function fnCreateUnitConfig(){return fnCreateConfig("get_unit_info");}

//find speed of a specific unit (m/field)
function getSpeed(unit){
	return parseFloat(unitConfig.find(unit+" speed").text());
}

//find pop of a specific unit
function getPop(unit){
	return parseFloat(unitConfig.find(unit+" pop").text());
}

//find base build time of a specific unit
function getBuildTime(unit){
	return parseFloat(unitConfig.find(unit+" build_time").text());
}

//get current village coord
function currentCoord(){
	return game_data.village.coord;
	}


/*simple calculation*/

// find the distance between two given coords
function distance(source, target){
	var fields = Math.sqrt(Math.pow(source[1]-target[1],2)+Math.pow(source[0]-target[0],2));
	return fields;
	}
	
//find travel time between two given coords for a specific unit
function travelTime(source, target, unit){
	var unitSpeed = getSpeed(unit);
	var fields=distance(source,target);
	var tt=unitSpeed*fields;
	return tt;
}

//add time (in minutes) to a date
function addTime(date,time){
	var date_ms=date.getTime();
	time=time*1000*60;
	newDate=date_ms+time;
	newDate=new Date(newDate);
	return newDate;
}

/*Core functions*/

//get a list of coords whith the rigth traveltime
function getGoodCoords(coords,unit,minTime,maxTime){
	var doc = document;
	var goodCoords=[];
	var servertime = window.$("#serverTime").html().match(/\d+/g);
	var serverDate = win.$("#serverDate").html().match(/\d+/g);
	serverTime = new Date(serverDate[1]+"/"+serverDate[0]+"/"+serverDate[2]+" "+servertime.join(":"));
	coords = coords.split(",");
	closest=60*500;
	far=0;
	
	for(i=0;i<coords.length-1;i++){
			coordsSplit = coords[i].split('|');
			travel=travelTime(coordsSplit, currentCoord().split("|"), unit);
			arrival=addTime(serverTime,travel);
			if (travel<closest){
				closest=travel;
			}
			else if (travel>far){
				far=travel;
			}
			if (arrival>minTime && arrival<maxTime)
			{
				goodCoords.push(coords[i]);
			}
		}
		
		if(goodCoords.length>0){
			console.log(goodCoords);
			index=Math.round(Math.random() * (goodCoords.length - 1));
			while(goodCoords.length>0 && alreadySent(currentCoord(),goodCoords[index])){
				goodCoords.splice(index,1);
				index=Math.round(Math.random() * (goodCoords.length - 1));
			}
			if(goodCoords.length>0){
				fillInCoords(goodCoords[index]);
				return goodCoords[index];
				}
			else{
				UI.ErrorMessage("تم الارسال من كل القرى الذي بالمدى، حاول لاحقا او غير نوع الوحدة",5000);
				return null;
			}
		}
		else{
			UI.ErrorMessage("لا توجد قرى في المدى النطاق المطلوب."+"\n"+" ستحتاج استعمال السكربت بالوقت بين "+addTime(minTime,(-1)*far).toString()+" و "+addTime(maxTime,(-1)*closest).toString(),6000);
			return null;
		}
}

//insert given coords as target
function fillInCoords(coords){
	coordsSplit = coords.split('|');
    document.forms[0].x.value = coordsSplit[0];
    document.forms[0].y.value = coordsSplit[1];
    $('#place_target').find('input').val(coordsSplit[0] + '|' + coordsSplit[1]);
}

//save sent coords
function alreadySent(myCoords,target){
	if(sessionStorage.alreadySent){
		history=JSON.parse(sessionStorage.alreadySent);
		if (myCoords in history){
			if (history[myCoords].includes(target)){
				return true
			}
			else{
				history[myCoords].push(target);
				return false
			}
		}
		else{
			history[myCoords]=[target];
			sessionStorage.alreadySent=JSON.stringify(history);
			return false
		}
	}
	else{
		history={}
		history[myCoords]=[target];
		sessionStorage.alreadySent=JSON.stringify(history);
		return false
	}
	
}


function fillInTroops(troopCount, troopPreferences){
    troopArray = troopPreferences;
    //find the slowest selected unit
    var keys=Object.keys(troopArray);
    slowest=["spy"];
    for (i=0;i<keys.length;i++){
    	if(troopArray[keys[i]] && troopCount[keys[i]]>0){
    		if(getSpeed(keys[i])>getSpeed(slowest[0])){
    			slowest=[];
    			slowest.push(keys[i]);
    		}
    		else if(getSpeed(keys[i])==getSpeed(slowest[0])){
    			slowest.push(keys[i]);
    		}
    	}
    }
    var fakePopNeeded = Math.ceil(game_data.village.points / 100);
    troopsToSend=new Array(keys.length).fill(0);
    troopsToSend[keys.indexOf(slowest[0])]++;
    fakePopNeeded-=getPop(slowest[0]);

    
    fasterBarrackTroops=findFasterBuild(troopArray)[0];
    fasterStableTroops=findFasterBuild(troopArray)[1];
    fasterWorkshopTroops=findFasterBuild(troopArray)[2];
    k=1;
    while (k>0){
    	if(fasterBarrackTroops.length>0 && troopCount[fasterBarrackTroops[0]]>troopsToSend[keys.indexOf(fasterBarrackTroops[0])]){
    		troopsToSend[keys.indexOf(fasterBarrackTroops[0])]++;
    		fakePopNeeded--;
    	}
    	else{
    		fasterBarrackTroops.shift();
    	}
    	
    	if(fakePopNeeded<=0){
    		break;
    	}
    	
    	if(fasterStableTroops.length>0 && troopCount[fasterStableTroops[0]]>troopsToSend[keys.indexOf(fasterStableTroops[0])]){
    		troopsToSend[keys.indexOf(fasterStableTroops[0])]++;
    		fakePopNeeded-=getPop(fasterStableTroops[0]);
    	}
    	else{
    		fasterStableTroops.shift();
    	}
    	
    	
    	if(fakePopNeeded<=0 || (fasterBarrackTroops.length<1 && fasterStableTroops.length<1)){
    		k=-1;
    	}
    	
    }
   if(fakePopNeeded<=0){
   	for(i=0;i<troopsToSend.length;i++){
   		document.forms[0][keys[i]].value = troopsToSend[i];
   	}
   	return slowest[0];
   }
   else{
   	alert("لا يوجد وحدات لارسال الوهميات");
   	return null;
   }
   
}


//find the unit whith the fastest base build time
function findFasterBuild(troopArray){
	var keys=Object.keys(troopArray);
	var barracks=[];
	var stable=[];
	var workshop=[];
	keys.sort(function sortByBuildTime(a,b){return getBuildTime(a)-getBuildTime(b);});
	for(i=0;i<keys.length;i++){
		if(troopArray[keys[i]]){
			if(getPop(keys[i])==1){
				barracks.push(keys[i]);
			}
			else if(keys[i]=="ram" || keys[i]=="catapult"){
				workshop.push(keys[i]);
			}
			else {
				stable.push(keys[i]);
			}
		}
	}
	return [barracks,stable, workshop];
}


/*------------------------------------------------------------------------------------------------------------*/
/*interface functions*/

function dateToIsoFormat(date){
	offset= -(new Date().getTimezoneOffset() / 60);
	date=new Date(date.getTime()+1000*60*60*offset);
	return date.toISOString().split(".")[0];
}

function setManual(){
	mode="manual";
	document.getElementById("coordsUrl").disabled=true;
	document.getElementById("arrivalUrl").disabled=true;
	document.getElementById("coords").disabled=false;
	document.getElementById("minDate").disabled=false;
	document.getElementById("maxDate").disabled=false;
}

function setByUrl(){
	mode="byUrl";
	document.getElementById("coords").disabled=true;
	document.getElementById("minDate").disabled=true;
	document.getElementById("maxDate").disabled=true;
	document.getElementById("coordsUrl").disabled=false;
	document.getElementById("arrivalUrl").disabled=false;
}

function getCoords(){
	coords=document.getElementById("coords").value.match(/\d\d\d\|\d\d\d/g);
}

function getCoordsUrl(){
	coordsUrl=document.getElementById("coordsUrl").value;
}

function getArrival(){
	minArrival=new Date(document.getElementById("minDate").value);
	maxArrival=new Date(document.getElementById("maxDate").value);
	document.getElementById("maxDate").min=document.getElementById("minDate").value;
	document.getElementById("minDate").max=document.getElementById("minDate").value;
}

function getArrivalUrl(){
	arrivalUrl=document.getElementById("arrivalUrl").value;
}

function updateUnits(){
	for(i=0;i<unitNames.length;i++){
		unitPreference[unitNames[i]]=document.getElementById(unitNames[i]+"Check").checked
	}
}

function saveSettings(){
	if (minArrival>maxArrival){
		UI.ErrorMessage('وقت الوصول خطا يانوب');
	}
	else if (coords==null){
		UI.ErrorMessage('ادخل على الاقل قرية هدف واحده ',5000);
	}
	else{
		if(mode=="manual"){
			localStorage.smartFakeSettings=mode+":::"+coords+":::"+minArrival+":::"+maxArrival+":::"+JSON.stringify(unitPreference);
		}
		else{
			localStorage.smartFakeSettings=mode+":::"+coordsUrl+":::"+arrivalUrl+":::"+JSON.stringify(unitPreference);
		}
		UI.SuccessMessage('Settings saved', 3000);
	}
	
}

function reset(){
	localStorage.removeItem("smartFakeSettings");
	coords=[];
	coordsUrl="";
	minArrival=new Date();
	maxArrival=new Date(minArrival.getTime() + 1000*60*60);
	arrivalUrl="";
	unitPreference={};
	mode="manual";
	unitNames=[];
	openUI();
}


function openUI(){
	images="";
	checkBoxes="";

	if(localStorage.smartFakeSettings){
		savedSettings=localStorage.smartFakeSettings.split(":::");
		if(savedSettings[0]=="manual"){
			mode=savedSettings[0];
			coords=savedSettings[1].replace(/,/g," ");
			minArrival=new Date(savedSettings[2]);
			maxArrival=new Date(savedSettings[3]);
			unitPreference=JSON.parse(savedSettings[4]);
			}
		else{
			mode=savedSettings[0];
			coordsUrl=savedSettings[1];
			arrivalUrl=savedSettings[2];
			unitPreference=JSON.parse(savedSettings[3]);
		}
	}


	for (var i = 0; i < game_data.units.length; i++) {
		if (game_data.units[i] != "militia" && game_data.units[i] != "knigth") {
			unitNames.push(game_data.units[i]);
		}
	}
	for(i=0;i<unitNames.length;i++){
		images=images+'<td style={border: 1px solid black; }><img src="https://dsen.innogamescdn.com/asset/cf2959e7/graphic/unit/unit_'+unitNames[i]+'.png" title='+unitNames[i]+' class="unitImage"></td>';
		if(unitNames[i] in unitPreference && unitPreference[unitNames[i]]){
			checkBoxes=checkBoxes+'<td><input type="checkbox" id='+unitNames[i]+"Check"+' onchange="updateUnits()" checked="true"></input></td>';
		}
		else{
			checkBoxes=checkBoxes+'<td><input type="checkbox" id='+unitNames[i]+"Check"+' onchange="updateUnits()" ></input></td>';
		}
	}

 	var html =     ' <head></head><body>    <h1>سكربت ارساليات لاوبات أوس</h1>    <form><fieldset><legend>Data Source</legend><h2>Select Data Source</h2><p><input type="radio" id="manual" name="source" value="manual" checked="true" onchange="setManual()">ادخل الاهداف والوقت بشكل يدوي</input></p><p><input type="radio" id="tribe" name="source" value="url" onchange="setByUrl()">ادخل الاهداف والوقت من رابط</input></p></fieldset>      <fieldset>        <legend>Manual settings</legend>         <p>         <h2>احداثيات الاهداف</h2> <label>الاحداثيات:</label>          <textarea id = "coords"                  rows = "5"                  cols = "70" placeholder="ادخل الاحداثيات للاهداف" onchange="getCoords()"></textarea>        </p>        <p><h2>وقت الوصول</h2> <label>الاحداثيات ستصل بين </label> <input type="datetime-local" id="minDate" value="'+dateToIsoFormat(minArrival)+'" onchange="getArrival()"><label> و </label> <input type="datetime-local" id="maxDate" value="'+dateToIsoFormat(maxArrival)+'" onchange="getArrival()" ></input></p> </fieldset> <fieldset><legend>اعدادات القبيلة</legend><p><h2>احداثيات الاهداف</h2><label>رابط الاهداف: </label><input type="text" id="coordsUrl" placeholder="https://dl.dropbox/خذه من أوس" onchange="getCoordsUrl()" disabled="true"></input></p><p><h2>الوصول</h2><label>رابط الوصول: </label><input type="text" id="arrivalUrl" placeholder="https://dl.dropbox/خذه من أوس" onchange="getArrivalUrl()" disabled="true"></input></p></fieldset></form> <fieldset><legend>اعدادات الوحدات</legend><table id="checkboxesTable" border="1"><tr><h2>اختار الوحده للاستعمال</h2></tr><tr>'+images+'</tr><tr>'+checkBoxes+'</tr></table></fieldset><p><input type="button" class="btn evt-confirm-btn btn-confirm-yes" id="save" onclick="saveSettings()" value="حفظ"></input> <input type="button" class="btn evt-confirm-btn btn-confirm-no" id="reset" onclick="reset()" value="اعادة الضبط يانوب"></input> </p></body>';

	Dialog.show("Script settings", html);
	if (mode == "manual"){
		document.getElementById("coordsUrl").disabled=true;
		document.getElementById("arrivalUrl").disabled=true;
		document.getElementById("coords").disabled=false;
		document.getElementById("minDate").disabled=false;
		document.getElementById("maxDate").disabled=false;
		document.getElementById("coords").value=coords;
		//document.getElementById("minDate").value=;
		//document.getElementById("maxDate").value=;
	}
	else{
		document.getElementById("coords").disabled=true;
		document.getElementById("minDate").disabled=true;
		document.getElementById("maxDate").disabled=true;
		document.getElementById("coordsUrl").disabled=false;
		document.getElementById("arrivalUrl").disabled=false;
		document.getElementById("coordsUrl").value=coordsUrl;
		document.getElementById("arrivalUrl").value=arrivalUrl;
		document.getElementById("tribe").checked=true;
	}
}



//ACTUAL CODE
if (game_data.screen == 'place') {
	win=window;
	unitConfig=fnCreateUnitConfig();
	var troopCounts = {};
    $('a[id^=units_entry_all_]').each(function (i, el) {
        var id = $(el).attr('id');
        var unit = id.match(/units_entry_all_(\w+)/)[1];
        var count = $(el).text();
        count = count.match(/\((\d+)\)/)[1];
        troopCounts[unit] = parseInt(count);
    });
	
	if(localStorage.smartFakeSettings){
		settings=localStorage.smartFakeSettings;
		mode=settings.split(":::")[0];
		if (mode == "manual"){
			coords=settings.split(":::")[1];
			minArrival=new Date(settings.split(":::")[2]);
			maxArrival=new Date(settings.split(":::")[3]);
			troopPreference=JSON.parse(settings.split(":::")[4]);
		}
		else if(mode == "byUrl"){
			coords=getCoordsByUrl(settings.split(":::")[1]);
			dates=getArrivalDate(settings.split(":::")[2]);
			minArrival=dates[0];
			maxArrival=dates[1];
			troopPreference=JSON.parse(settings.split(":::")[3]);
			
		}
		troops=fillInTroops(troopCounts, troopPreference);
		if(troops!=null){
			target=getGoodCoords(coords,troops, minArrival, maxArrival);
		}
	}
	else{
		var coords=[];
		var coordsUrl="";
		var minArrival=new Date();
		var maxArrival=new Date(minArrival.getTime() + 1000*60*60);
		var arrivalUrl="";
		var unitPreference={};
		var mode="manual";
		var unitNames=[];
		openUI();
	}
}

else{
	var coords=[];
	var coordsUrl="";
	var minArrival=new Date();
	var maxArrival=new Date(minArrival.getTime() + 1000*60*60);
	var arrivalUrl="";
	var unitPreference={};
	var mode="manual";
	var unitNames=[];

	openUI();
}