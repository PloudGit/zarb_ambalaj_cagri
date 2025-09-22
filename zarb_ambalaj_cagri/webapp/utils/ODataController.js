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

		getCallList: function (that) {

			var url = "/CgrItemsSet";

			var dModel = that.getOModel(that, "dm");
			var dData = dModel.getData();

			debugger;

			var oDataModel = that.getOwnerComponent().getModel();
			var selectedRowCallList = dData["selectedRow"];

			var aFilters = [];

			if (selectedRowCallList.Ebeln) {
				aFilters.push(new sap.ui.model.Filter("Ebeln", sap.ui.model.FilterOperator.EQ, selectedRowCallList.Ebeln));
			}

			if (selectedRowCallList.Ebelp) {
				aFilters.push(new sap.ui.model.Filter("Ebelp", sap.ui.model.FilterOperator.EQ, selectedRowCallList.Ebelp));
			}

			that.openBusyDialog();

			oDataModel.read(url, {
				filters: aFilters,
				success: function (oData, oResponse) {
					debugger;
					that.closeBusyDialog();
					dData["CallList"] = oData["results"];
					dModel.refresh();

					that._callListPopup().open();

				},
				error: function (oError) {
					that.closeBusyDialog();
					that._oData.handleODataErrors(that);

				}

			});

		},

		checkQuota: function (that) {
			return new Promise(function (resolve, reject) {

				var url = "/CgrHeaderSet";

				var dModel = that.getOModel(that, "dm");
				var dData = dModel.getData();

				const row = dData.selectedRowCallList;

				const item = {
					Ebeln: row.Ebeln,
					Eindt: row.Eindt,
					Meins: row.Meins,
					Ebelp: row.Ebelp,
					Etenr: row.Etenr,
					Logsy: row.Logsy,
					ApKey: row.ApKey,
					Menge: row.Menge,
					Slfdt: row.Slfdt,
					Normt: row.Normt,
					Lifnr: row.Lifnr
				};

				var data = {
					"Action": "Q",
					"Ebeln": row.Ebeln,
					"Ebelp": row.Ebelp,
					"Logsy": row.Logsy,
					"ApKey": row.ApKey,
					"ToCgrItems": [item]
				};

				var oDataModel = that.getOwnerComponent().getModel();

				that.openBusyDialog();

				debugger;
				oDataModel.create(url, data, {
					success: function (oData, oResponse) {
						debugger;
						// Servisten dönen sonuca göre kontrol
						if (oData && oData.IsExceed !== true) {
							resolve(true);  // işlem devam etsin
						} else {
							resolve(false); // mesaj verilecek
						}
						that.closeBusyDialog();
					},
					error: function (oError) {
						that.closeBusyDialog();

						that._oData.handleODataErrors(that);
						resolve(false);

					}

				});

			});
		}



	});
});