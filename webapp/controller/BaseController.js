sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function (Controller, History) {
	"use strict";
	/**	@name 	BaseController
	 * 	@brief	The Parent-Controller of all Controllers. Functions that are defined here can be used in all views,
	 * 			but only when the view has a controller that extends this BaseController. Functions that are used by more than
	 * 			one Controller should be implemented here so that they only need to be defined once.
	 * 	@date	06.09.18
	 * */
	return Controller.extend("root.controller.BaseController", {
		getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		/**	@name 	onNavBack
		 * 	@brief	Redirects the user back to the previous page or the apps Homepage depending on the hash-path.
		 * 	@date	06.09.18
		 * */
		onNavBack: function (oEvent) {
			var oHistory, sPreviousHash;
			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("appHome");
			}
		},

		onNavHome: function (oEvent) {
			this.getRouter().navTo("appHome");
		}
	});
});
