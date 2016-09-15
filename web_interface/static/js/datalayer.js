function DataLayer() {

	this.restPost = function (url, successCB, errorCB, data) {

		$.ajax({
			url: url,
			method: "POST",
			dataType: "json",
			data: JSON.stringify(data),
			success: successCB,
			error: errorCB
		});

	};

	this.restGet = function (url, successCB, errorCB) {

		return $.ajax({
			url: url,
			dataType: "json"
		});

	}

};