/*
	Publishing on the Web assignment site script.
	Copyright (c) 2011 Sam Saint-Pettersen.

	This code is dependent on jQuery 1.6+.
*/

var replaceContent = false; // Replace page content, initially false.

// Function triggered on index page load.
function onLoad() {


	// Append 'Powered by XHTML + CSS + jQuery.' message to index page.
	$('div#footer').append('<p>Powered by <a class="extern"' 
	+ 'href="http://validator.w3.org/check?uri=referer">'
	+ 'XHTML</a> + <a class="extern"' 
	+ 'href="http://jigsaw.w3.org/css-validator/check/referer">CSS</a> +'
	+ ' <a class="extern" href="http://jquery.com">jQuery</a>.</p>');

	// Make extern class links open in a new window.
	$('a.extern').attr('target', '_blank');

	// Load the report's introduction page.
	loadPage('introduction'); 
}

// Parse references for potb_references page.
function parseReferences(xmlp) {

	// RAN OUT OF TIME TO IMPLEMENT...
}

// Load the requested academic page of the assignment report.
function loadPage(p) {

	
	var prefix = 'potw_';
	var suffix = '.xml';
	var page = prefix + p + suffix;

	// Peform an Ajax request.
	// Assign handlers immediately after making the request
	// and remember the jqxhr object for this request.
	var jqxhr = $.ajax({ url: page })
	.success(function() {
		var xmlPage = jqxhr.responseXML;
		var content = xmlPage.getElementsByTagName('page-body')[0].childNodes[0].nodeValue;
		if(!replaceContent) {
			if(page != 'potw_references.xml') {;
				$('div#academic-page').append(content);
			}
			else parseRefences(xmlPage);
		}
		else {
			$('div#page').remove()
			$('div#academic-page').append(content);
		}

		replaceContent = true;

	})
	.error(function() {
		alert(jqxhr.statusText.toUpperCase() + ":\nCould not retrieve report page: " 
		+ page);
	})
}
