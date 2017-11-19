// Change this value to override the environment
var environment = "demo";

// Default API gateway
var urlRoot = "https://" + environment + "-api.ig.com/gateway/deal";

var url = window.location.href;

// If deployed to a labs environment, override the default demo urlRoot
var env = url.match("https?:\/\/(.*)-labs.ig.com");



function connectToLightstreamer() {

	// Instantiate Lightstreamer client instance
	console.log("Connecting to Lighstreamer: " + lsEndpoint);
	lsClient = new LightstreamerClient(lsEndpoint);

	// Set up login credentials: client
	lsClient.connectionDetails.setUser(accountId);

	var password = "";
	if (client_token) {
		password = "CST-" + client_token;
	}
	if (client_token && account_token) {
		password = password + "|";
	}
	if (account_token) {
		password = password + "XST-" + account_token;
	}
	console.log(" LSS login " + accountId + " - " + password);
	lsClient.connectionDetails.setPassword(password);

	// Add connection event listener callback functions
	lsClient.addListener({
		onListenStart: function () {
			console.log('Lightstreamer client - start listening');
		},
		onStatusChange: function (status) {
			console.log('Lightstreamer connection status:' + status);
		}
	});

	// Allowed bandwidth in kilobits/s
	//lsClient.connectionOptions.setMaxBandwidth();

	// Connect to Lightstreamer
	lsClient.connect();
}

/*
 * User interface login button callback function
 */
function login() {

	// Get username and password from user interface fields
	apiKey = $("#inputAPIKey").val();
	var identifier = $("#inputUsername").val();
	var password = $("#inputPassword").val();

	if (apiKey=="" || identifier=="" || password=="") {
		return false;
	}

	//password = encryptedPassword(password);
	console.log("Encrypted password " + password);

	// Create a login request, ie a POST request to /session
	var req = new XMLHttpRequest();
	req.method = "POST";
	req.url = urlRoot + "/session";

	// Set up standard request headers, i.e. the api key, the request content type (JSON), 
	// and the expected response content type (JSON)
	req.headers = {
		"Content-Type": "application/json; charset=UTF-8",
		"Accept": "application/json; charset=UTF-8",
		"X-IG-API-KEY": apiKey,
		"Version": "2"
	};

	// Set up the request body with the user identifier (username) and password
	var bodyParams = {};
	bodyParams["identifier"] = identifier;
	bodyParams["password"] = password;
	bodyParams["encryptedPassword"] = true;
	req.body = JSON.stringify(bodyParams);

	// Prettify the request for display purposes only
	//$("#request_data").text(js_beautify(req.body) || "");
	
	// Send the request via a Javascript AJAX call
	try {
		$.ajax({
			type: req.method,
			url: req.url,
			data: req.body,
			headers: req.headers,
			async: false,
			mimeType: req.binary ? 'text/plain; charset=x-user-defined' : null,
			success: function (response, status, data) {

				// Successful login 
				// Extract account and client session tokens, active account id, and the Lightstreamer endpoint,
				// as these will be required for subsequent requests
				account_token = data.getResponseHeader("X-SECURITY-TOKEN");
				console.log("X-SECURITY-TOKEN: " + account_token);
				client_token = data.getResponseHeader("CST");
				console.log("CST: " + client_token);
				accountId = response.currentAccountId;
				lsEndpoint = response.lightstreamerEndpoint;

				// Prettify response for display purposes only
				//$("#response_data").text(js_beautify(data.responseText) || "");

				// Show logged in status message on screen
				//$("#loginStatus").css("color", "green").text("Logged in as " + accountId);
				$(".alert").alert();
				
			},
			error: function (response, status, error) {

			// Login failed, usually because the login id and password aren't correct
			handleHTTPError(response);
			}
		});
	} catch (e) {
		handleException(e);
	}

	return true;

}


$('#loginButton').click(function () {
	if (login()) {
		debugger;
		connectToLightstreamer();
		//subscribeToLightstreamerTradeUpdates();
		//showTradingPane();
	}
});