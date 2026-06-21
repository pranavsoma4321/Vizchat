module.exports = function (app, client) {
	let currPath = "/backend";


	// GET APIs

	// API URL => /file_system/query_data
	app.get(currPath + "/backend", function (req, res) {

		let urlLogicOBJ = require(__dirname + "/../backend/server.js");
		urlLogicOBJ.main(req, res, client);
	});
}
	