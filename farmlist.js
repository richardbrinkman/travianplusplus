function dorf1() {
	var mapdetails = document.getElementById("map_details")
	if (mapdetails)
		mapdetails.innerHTML += 
			"<div class=\"boxes villageList units\">" +
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
						"<tbody>"+
							"<tr colspan=\"3\"><td>Tralala</td></tr>"+
						"</tbody>"
					"</table>"
				"</div>"+
			"</div>";
}

var uri = document.documentURI;
var map = [
	{
		regexp: /http:\/\/ts4.travian.nl\/dorf1.php/,
		func: dorf1
	}
];
for (i=0; i<map.length; i++)
	if (map[i].regexp.test(uri))
		map[i].func();
