sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/model/json/JSONModel"
], function (
	ManagedObject,
	JSONModel
) {
	"use strict";

	return ManagedObject.extend("com.app.abdiibrahim.zarbambalajcagri.utils.DataModel", {

		//Create Data Management Model
		createDM: function (that) {


			var dModel = new JSONModel();
			// var i18n = that.getView().getModel("i18n").getResourceBundle();


			var dData = {
				ReviseNote:"",
				CancelNote:"",
				selectedRow: {},
				selectedRowCallList:{},
				OrderList: []
			}


			dModel.setData(dData);
			dModel.refresh();

			sap.ui.getCore().setModel(dModel, "dm");
			that.getView().setModel(dModel, "dm");
		},

		//Create Property Management Model
		createPM: function (that) {

			var pModel = new JSONModel();

			var pData = {

				popup: {
					title: "",     
					action: "",     
					fields: {
						TermItemNum: { visible: true, editable: false },
						Quantity: { visible: true, editable: true },
						Unit: { visible: true, editable: false },
						DeliveryDate: { visible: true, editable: true },
						FirmDelivery: { visible: true, editable: true },
						PrintCode: { visible: true, editable: true },
						ReviseNote: { visible: false, editable: true },
						CancelNote: { visible: false, editable: true }
					}
				}
			}

			// pModel.loadData(sPath, "false");
			pModel.setData(pData);
			pModel.refresh();

			sap.ui.getCore().setModel(pModel, "pm");
			that.getView().setModel(pModel, "pm");

		},

		//Create Backend Management Model
		createBM: function (that) {


			var bModel = new JSONModel();

			var bData = {

			}

			bModel.setData(bData);
			// bModel.loadData(sPath, "true");
			bModel.refresh();


			sap.ui.getCore().setModel(bModel, "bm");
			that.getView().setModel(bModel, "bm");

		},

		createAllModel: function (that) {

			this.createDM(that);
			this.createPM(that);
			this.createBM(that);

		}


	});
});
