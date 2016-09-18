/* global Utils, TemplateView, LoaderView, _ */

var CONFIGS = null;

(function () {

	var utils = new Utils(),
		loader = new LoaderView();
	
	loader.start();
	
	utils.getConfig("/static/config.json")
	.then(function (data) {
		CONFIGS = data;
		utils.getData()
		.then(function (data) {
			var obj = new TemplateView(data).build();
			return _.extend(obj, { data: data });		
		})
		.then(function (data) {
			utils.smartCheckData(data)
			.then(function () {
				loader.stop();
			})
			.fail(function () {
				throw new Error("Error on SmartCheck first POST");
			});
		})
		.fail(function () {
			throw new Error("Error on annotations GET");
		}); 
	})
	.fail(function () {
		throw new Error("Unable to load configuration file");
	})

})()