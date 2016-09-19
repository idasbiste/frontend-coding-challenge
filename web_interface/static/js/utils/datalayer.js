/* global $ */

function DataLayer() {

	this.restPost = function (url, crossDomain, data) {
		return $.ajax({
			url: url,
			method: "POST",
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify(data),
			crossDomain: crossDomain
		});
	};

	this.restGet = function (url) {
		return $.ajax({
			url: url,
			dataType: "json"
		});
	};

	
	this.localGet = function (id) {
		return $.get(id);
	};

};