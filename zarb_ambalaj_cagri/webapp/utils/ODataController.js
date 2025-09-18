sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/m/BusyDialog",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox"
], function (
	ManagedObject,
	BusyDialog,
	Filter,
	FilterOperator,
	MessageBox
) {
	"use strict";

	return ManagedObject.extend("com.app.abdiibrahim.zarbambalajcagri.utils.ODataController", {

		handleODataErrors: function (that) {
			var errors = that.getOModel(that, "message").oData;
			var messages = '';

			errors.forEach(function (element) {
				if (element.message && !element.message.includes("An exception was raised")) {
					messages += element.message + '\n';
				}
			});

			if (messages.trim() !== '') {
				MessageBox.error(messages);
			}
		},

		getOrderList: function (that, aFilters) {

			debugger

			var url = "/OrderListsSet";

			var bModel = that.getOModel(that, "bm");
			var bData = bModel.getData();

			var dModel = that.getOModel(that, "dm");
			var dData = dModel.getData();

			debugger;

			var oDataModel = that.getOwnerComponent().getModel();
			var oFilters = [];

			that.openBusyDialog();

			oDataModel.read(url, {
				filters: aFilters,
				success: function (oData, oResponse) {
					debugger;
					that.closeBusyDialog();
					dData["OrderList"] = oData["results"];
					dModel.refresh();
				},
				error: function (oError) {
					that.closeBusyDialog();
					that._oData.handleODataErrors(that);

				}

			});

		},


	});
});