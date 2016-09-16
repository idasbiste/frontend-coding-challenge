/* global Utils, TemplateView, _ */

(function () {

	var utils = new Utils();
	
	utils.getData()
	.then(function (data) {
		var obj = new TemplateView(data).build();
		return _.extend(obj, { data: data });		
	})
	.then(function (data) {
		utils.smartCheckData(data)
		.fail(function () {
			throw new Error("Error on SmartCheck first POST");
		});
	})
	.fail(function () {
		throw new Error("Error on annotations GET");
	}); 

})()