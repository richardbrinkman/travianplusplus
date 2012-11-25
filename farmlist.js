function delfarm(e) {
	chrome.storage.sync.get(null, function(db) {
		if (!db)
			db = {};
		if (!db.farms)
			db.farms = [];
		db.farms.splice(e.target.id,1);
		chrome.storage.sync.set(db, function() {
			window.location.href="http://ts4.travian.nl/dorf1.php";
		});
	});
}

function dorf1() {
	chrome.storage.sync.get(null, function(db) {
		var mapdetails = document.getElementById("map_details");
		var clearDiv = document.evaluate(
			"./div[@class=\"clear\"]",
			mapdetails,
			null,
			XPathResult.ANY_TYPE,
			null
		).iterateNext();
		var farms = document.createElement("div");
		farms.className = "boxes villageList units";
		var html =
			"<div class=\"boxes-tl\"></div>"+
			"<div class=\"boxes-tr\"></div>"+
			"<div class=\"boxes-tc\"></div>"+
			"<div class=\"boxes-ml\"></div>"+
			"<div class=\"boxes-mr\"></div>"+
			"<div class=\"boxes-mc\"></div>"+
			"<div class=\"boxes-bl\"></div>"+
			"<div class=\"boxes-br\"></div>"+
			"<div class=\"boxes-bc\"></div>"+
			"<div class=\"boxes-contents cf\">"+
				"<table id=\"farmlist\" cellpadding=\"1\" cellspacing=\"1\">"+
					"<thead>"+
						"<tr style=\"display: table-row; \">"+
							"<th colspan=\"3\">Farmlist:</th>"+
						"</tr>"+
					"</thead>"+
					"<tbody>";
		if (db.farms)
			for (i=0; i<db.farms.length; i++)
				html +=
					"<tr>"+
						"<td colspan=\"2\">"+
							"<a href=\"http://ts4.travian.nl/position_details.php?x=" + db.farms[i].x + "&y=" + db.farms[i].y + "\">" + db.farms[i].villageName + "</a>"+
						"</td>"+
						"<td>"+
							"<a>"+
								"<img id=\"" + i + "\" src=\"img/x.gif\" class=\"del\">"+
							"</a>"+
						"</td>"+
					"</tr>";
		html +=
					"</tbody>"+
				"</table>"+
			"</div>";
		farms.innerHTML = html;
		mapdetails.insertBefore(farms, clearDiv);
		for (i=0; i<db.farms.length; i++) {
			var link = document.getElementById(i);
			link.onclick = delfarm;
		}
	});
}

function addToFarmList() {
	var coordinates = document.evaluate(
		"//div[@id=\"content\"]/h1/span[1]",
		document,
		null,
		XPathResult.ANY_TYPE,
		null
	).iterateNext();
	var farm = {
		villageName: document.evaluate(
			"./span[@class=\"coordText\"]", 
			coordinates, null, XPathResult.ANY_TYPE, null
		).iterateNext().innerText,
		x: document.evaluate(
			"./span[@class=\"coordinatesWrapper\"]/span[@class=\"coordinateX\"]",
			coordinates, null, XPathResult.ANY_TYPE, null
		).iterateNext().innerText.slice(1),
		y: document.evaluate(
			"./span[@class=\"coordinatesWrapper\"]/span[@class=\"coordinateY\"]",
			coordinates, null, XPathResult.ANY_TYPE, null
		).iterateNext().innerText.replace(")", "")
	}
	chrome.storage.sync.get(null, function(db) {
		if (!db)
			db = {};
		if (!db.farms)
			db.farms = [];
		db.farms.push(farm); //TODO: check if farm already exists
		chrome.storage.sync.set(db, function() {
			alert("Toegevoegd: "+ farm.villageName + " op " + farm.x + "," + farm.y);
		});
	});
}

function positionDetails() {
	var tileDetails = document.getElementById("tileDetails");
	if (tileDetails) {
		var detailImage = tileDetails.getElementsByTagName("div");
		if (detailImage.length>0) {
			var options = detailImage[0].getElementsByTagName("div");
			if (options.length>0) {
				options[0].innerHTML += 
					"<div class=\"option\">"+
						"<a id=\"addToFarmListLink\" class=\"a arrow\" title=\"Voeg aan farmlijst toe\">Voeg aan farmlijst toe</a>"+
					"</div>";
				document.getElementById("addToFarmListLink").onclick = addToFarmList;
			}
		}
	} else
	window.alert("Geen tileDetails gevonden");
}

function addgraphtab() {
	var tabs = document.evaluate(
		"//div[@class=\"contentNavi tabNavi \"]",
		document,
		null,
		XPathResult.ANY_TYPE,
		null
	).iterateNext();
	var cleartab = document.evaluate(
		"./div[@class=\"clear\"]",
		tabs,
		null,
		XPathResult.ANY_TYPE,
		null
	).iterateNext();
	var graphtab = document.createElement("div");
	graphtab.setAttributeNode(document.createAttribute("title"));
	graphtab.className="container normal";
	graphtab.innerHTML=
		"<div class=\"background-start\">&nbsp;</div>" +
		"<div class=\"background-end\">&nbsp;</div>" +
		"<div class=\"content\">" +
			"<a href=\"statistiken.php?id=0&idSub=4\" class=\"tabItem\">Grafiek</a>"+
		"</div>";
	tabs.insertBefore(graphtab, cleartab);
	if (window.location.search == "?id=0&idSub=4") {
		//Unfocus other tabs
		var othertabs = tabs.getElementsByTagName("div");
		for (i=0; i<4; i++)
			if (othertabs[i].hasAttribute("title"))
				othertabs[i].className="container normal";

		//Give focus to Grafiek tab
		graphtab.className="container active";

		//Set the header
		var content=document.getElementById("content");
		content.getElementsByTagName("h4")[0].innerText="Grondstoffen grafiekjes";

		//Remove the content
		content.removeChild(document.getElementById("player"));
		content.removeChild(document.getElementById("search_navi"));

		var cleardiv = document.evaluate(
			"./div[@class=\"clear\"]",
			content,
			null,
			XPathResult.ANY_TYPE,
			null
		).iterateNext();
		
		var villageList=document.getElementById("villageListLinks");
		var villages=villageList.getElementsByTagName("li");

		//Define dimensions
		var height = 300;
		var width = 520;
		var bordermargin = 20;
		var hours = 24;

		//Iterate over all the villages
		var graphs = [];
		for (i=0; i<villages.length; i++) {
			//Add village name as header
			var villageHeader = document.createElement("h5");
			var villageLink = villages[i].getElementsByTagName("a")[0];
			villageHeader.innerText=villageLink.innerText;
			content.insertBefore(villageHeader, cleardiv);

			//Add the resources graph
			graphs[i] = {};
			graphs[i].svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
			graphs[i].svg.setAttribute("version", "1.1");
			graphs[i].svg.setAttribute("width", width+bordermargin);
			graphs[i].svg.setAttribute("height", height+bordermargin);
			graphs[i].svg.setAttribute("id", i);

			//Draw axes
			graphs[i].group=document.createElementNS("http://www.w3.org/2000/svg","g");
			graphs[i].group.setAttribute("id","axis");
			graphs[i].group.setAttribute("style", "fill:none; stroke:black; stroke-width:3");
			graphs[i].axis=document.createElementNS("http://www.w3.org/2000/svg","path");
			graphs[i].axis.setAttribute("d", "M" + bordermargin + " 0 l0 " + height + " l" + width + " 0");
			graphs[i].group.appendChild(graphs[i].axis);

			graphs[i].dorf1 = new XMLHttpRequest();
			graphs[i].dorf1.responseType = "document";
			graphs[i].dorf1.graph=graphs[i];
			graphs[i].dorf1.onreadystatechange = function() {
				if (this.readyState == 4) { //finished loading
					//Get resources
					var wood = this.response.getElementById("l1").innerText.split("/");
					var clay = this.response.getElementById("l2").innerText.split("/");
					var iron = this.response.getElementById("l3").innerText.split("/");
					var crop = this.response.getElementById("l4").innerText.split("/");

					//Get capacities
					var resourceCapacity = wood[1];
					var cropCapacity = crop[1];
					var capacity = resourceCapacity < cropCapacity ? cropCapacity : resourceCapacity;

					//Get production
					var production = this.response.getElementById("production").getElementsByTagName("tbody")[0].getElementsByTagName("tr");
					var woodProduction = production[0].getElementsByTagName("td")[2].innerText.replace(/[^0-9]/g, "");
					var clayProduction = production[1].getElementsByTagName("td")[2].innerText.replace(/[^0-9]/g, "");
					var ironProduction = production[2].getElementsByTagName("td")[2].innerText.replace(/[^0-9]/g, "");
					var cropProduction = production[3].getElementsByTagName("td")[2].innerText.replace(/[^0-9]/g, "");

					//Define translate object
					var translate = {
						x: function(rx) {
							return bordermargin + width*rx/hours; //TODO parse time, etc.
						},
						y: function(ry) {
							return height - height*ry/capacity;
						}
					};

					//Draw resource capacity line
					var resourceCapacityLine=document.createElementNS("http://www.w3.org/2000/svg","path");
					resourceCapacityLine.setAttribute("style", "stroke:brown; stroke-width:2; fill: none");
					resourceCapacityLine.setAttribute("d", "M" + bordermargin + " " + translate.y(resourceCapacity) + " l" + width + " 0");
					this.graph.svg.appendChild(resourceCapacityLine);
					
					//Draw crop capacity line
					var cropCapacityLine=document.createElementNS("http://www.w3.org/2000/svg","path");
					cropCapacityLine.setAttribute("style", "stroke:yellow; stroke-width:2; fill: none");
					cropCapacityLine.setAttribute("d", "M" + bordermargin + " " + translate.y(cropCapacity) + " l" + width + " 0");
					this.graph.svg.appendChild(cropCapacityLine);
				}	
			};
			graphs[i].dorf1.open("GET", "dorf1.php" + villageLink.getAttribute("href"), true);
			graphs[i].dorf1.send();

			graphs[i].svg.appendChild(graphs[i].group);
			content.insertBefore(graphs[i].svg, cleardiv);
		}
	}
}

var uri = document.documentURI;
var map = [
	{
		regexp: /http:\/\/ts4.travian.nl\/dorf1.php/,
		func: dorf1
	},
	{
		regexp: /http:\/\/ts4.travian.nl\/position_details.php/,
		func: positionDetails
	},
	{
		regexp: /http:\/\/ts4.travian.nl\/statistiken.php/,
		func: addgraphtab
	}
];
for (i=0; i<map.length; i++)
	if (map[i].regexp.test(uri))
		map[i].func();
