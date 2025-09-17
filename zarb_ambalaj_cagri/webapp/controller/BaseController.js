sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"com/app/abdiibrahim/zarbambalajcagri/utils/DataModel"
], function (
	Controller,
	JSONModel,
	MessageBox,
	DataModel) {
	"use strict";
	return Controller.extend("com.app.abdiibrahim.zarbambalajcagri.controller.BaseController", {

		//View Model ÃaÄÄ±rma
		getOModel: function (that, modelName) {

			return that.getView().getModel(modelName);
		},

		//Core Model ÃaÄÄ±rma
		getCoreModel: function (modelName) {
			return sap.ui.getCore().getModel(modelName);
		},

		//Busy Dialog OluÅtur
		getBusyDialog: function () {
			if (!this._busy) {
				this._busy = new sap.m.BusyDialog();
			}
			return this._busy;
		},

		//Busy Dialog BaÅlat
		openBusyDialog: function () {
			this.getBusyDialog().open();
		},

		//Busy Dialog Kapat
		closeBusyDialog: function () {
			this.getBusyDialog().close();
		},

		//View Model Set
		setViewModel: function (that) {
			//Util KÃ¼tÃ¼phaneleri
			that.addUtils(that);
			//Modeller
			that._DataModel.createDM(that);
			that._DataModel.createPM(that);
			that._DataModel.createBM(that);
		},

		//Util Kutuphanelerini Ekleme
		addUtils: function (that) {

			//Modeller
			this._DataModel = new DataModel();
		},

		//Tablo SatÄ±r Ekleme
		onAddRow: function (that, tableName, tableRow) {
			var dModel = that.getOModel(that, "dm");

			var Table = dModel.getData()[tableName];

			var DefaultTableRow = dModel.getData()[tableRow];

			var newRow = jQuery.extend(true, {}, DefaultTableRow);

			Table.push(newRow);

			dModel.getData()[tableName] = Table;

			dModel.refresh();

		},

		onAddRowImportOperationItemTable(that, tableName, tableRow) {
			var dModel = that.getOModel(that, "dm");

			var Table = dModel.getData()[tableName];

			var DefaultTableRow = dModel.getData()[tableRow];

			var newRow = jQuery.extend(true, {}, DefaultTableRow);

			newRow.Waers = 'AZN';

			Table.push(newRow);

			dModel.getData()[tableName] = Table;

			dModel.refresh();

		},

		onAddRowPoDetailTable: function (that, tableModel, tableName, tableRow) {
			var dModel = that.getOModel(that, "dm");

			var Table = dModel.getData()[tableModel][tableName];

			var DefaultTableRow = dModel.getData()[tableRow];

			var newRow = jQuery.extend(true, {}, DefaultTableRow);

			Table.push(newRow);

			dModel.getData()[tableModel][tableName] = Table;

			dModel.refresh();

		},

		//Tablo SeÃ§ili SatÄ±r Silme
		onDeleteRowPoDetailTable: function (that, tableModel, tableName, tableId) {
			debugger;
			var dModel = that.getOModel(that, "dm");

			var Table = dModel.getData()[tableModel][tableName];

			var sItems = that.getView().byId(tableId)._aSelectedPaths;
			sItems.sort();

			for (var index = sItems.length; index > 0; index--) {
				var ind = (index - 1);

				var sItem = sItems[ind];

				var tabInd = sItem.split("/")[3];

				Table.splice(tabInd, 1);
			}
			that.getView().byId(tableId).removeSelections();

			dModel.refresh();
		},

		//Tablo SeÃ§ili SatÄ±r Silme
		onDeleteRow: function (that, tableName) {
			debugger;
			var dModel = that.getOModel(that, "dm");

			var Table = dModel.getData()[tableName];

			var sItems = that.getView().byId(tableName)._aSelectedPaths;

			for (var index = sItems.length; index > 0; index--) {
				var ind = (index - 1);

				var sItem = sItems[ind];

				var tabInd = sItem.split("/")[2];

				Table.splice(tabInd, 1);
			}
			that.getView().byId(tableName).removeSelections();

			dModel.refresh();
		},

		onDeleteRowFromFragment: function (that, tableModelName, tableId, fragmentId) {
			debugger;

			var dModel = that.getOModel(that, "dm");

			var Table = dModel.getData()[tableModelName];

			var sItems = sap.ui.core.Fragment.byId(fragmentId, tableId)._aSelectedPaths;

			for (var index = sItems.length; index > 0; index--) {
				var ind = (index - 1);

				var sItem = sItems[ind];

				var tabInd = sItem.split("/")[2];

				Table.splice(tabInd, 1);
			}

			sap.ui.core.Fragment.byId(fragmentId, tableId).removeSelections();

			dModel.refresh();

		},

		//Message PopOver Set
		setMessagePopover: function (that) {
			var oMessageManager = sap.ui.getCore().getMessageManager();
			that.getView().setModel(oMessageManager.getMessageModel(), "message");

			oMessageManager.registerObject(that.getView(), true);
		},

		//Message PopOver Fragment
		_getMessagePopover: function (that) {
			if (!that._oMessagePopover) {
				that._oMessagePopover = sap.ui.xmlfragment("com.app.abdiibrahim.zarbambalajcagri.view.fragments.messagePopover", this);
				that.getView().addDependent(that._oMessagePopover);

			}
			return that._oMessagePopover;
		},

		//Message Manager Otomatik AÃ§Ä±lma
		openMessagePopover: function (that) {
			that._getMessagePopover(that).openBy(that.getView().byId("btnMPopover"));
		},

		//MessageBox Genel KullanÄ±m
		showMessage: function (type, bundleName) {
			var i18n = this.getView().getModel("i18n").getResourceBundle();
			var text = i18n.getText(bundleName);

			switch (type) {
				case "success":
					MessageBox.success(text);
					break;
				case "information":
					MessageBox.information(text);
					break;
				case "error":
					MessageBox.error(text);
					break;
				default:
					break;
			}
		},

		//MessageBox Confirm Genel KullanÄ±m
		confirmMessage: function (that, bundleName) {
			var bundle = that.getView().getModel("i18n").getResourceBundle();
			MessageBox.show(bundle.getText(bundleName), {
				icon: MessageBox.Icon.Warning,
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				title: bundle.getText(bundleName + "Title"),
				onClose: function (sButton) {
					if (sButton === MessageBox.Action.OK) {
						that.ActionOk(that, bundleName);
					} else if (sButton === MessageBox.Action.CANCEL) {
						that.ActionCancel(that, bundleName);
					}
				}
			});
		},

		//response'lu yapı callbackfunctiona kullanıcı yanıtı döner..
		confirmMessageResponse: function (that, bundleName, callBackFunction) {
			var bundle = that.getView().getModel("i18n").getResourceBundle();
			MessageBox.show(bundle.getText(bundleName), {
				icon: MessageBox.Icon.Warning,
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				title: bundle.getText("titleConfirm"),
				onClose: function (sButton) {
					if (sButton === MessageBox.Action.OK) {
						callBackFunction(that, MessageBox.Action.OK);
					} else if (sButton === MessageBox.Action.CANCEL) {
						callBackFunction(that, MessageBox.Action.CANCEL);
					}
				}
			});
		},

		confirmMessageWithActonResponse: function (that, bundleName, callBackFunction, action) {
			var bundle = that.getView().getModel("i18n").getResourceBundle();
			MessageBox.show(bundle.getText(bundleName), {
				icon: MessageBox.Icon.Warning,
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				title: bundle.getText("titleConfirm"),
				onClose: function (sButton) {
					if (sButton === MessageBox.Action.OK) {
						callBackFunction(that, MessageBox.Action.OK, action);
					} else if (sButton === MessageBox.Action.CANCEL) {
						callBackFunction(that, MessageBox.Action.CANCEL);
					}
				}
			});
		},
		//Value State KullanÄ±m

		setValueState: function (that, item, type, bundleName) {
			var oView = that.getView();
			var bundle = that.getView().getModel("i18n").getResourceBundle();

			switch (type) {
				case "error":
					oView.byId(item).setValueState(sap.ui.core.ValueState.Error);
					oView.byId(item).setValueStateText(bundle.getText(bundleName));
					break;
				case "OK":
					oView.byId(item).setValueState(sap.ui.core.ValueState.None);
					break;
				default:
					break;
			}
		},

		//Input Numeric Only
		numericOnly: function (oEvent) {
			var _oInput = oEvent.getSource();
			var val = _oInput.getValue();
			val = val.replace(/[^\d]/g, '');
			_oInput.setValue(val);
		},

		//Get Value
		getValue: function (that, HeaderName, Variable) {
			var dModel = that.getOModel(that, "dm");
			return dModel.getData()[HeaderName][Variable];
		},

		//Set Value
		setValue: function (that, HeaderName, Variable, value) {
			var dModel = that.getOModel(that, "dm");
			dModel.getData()[HeaderName][Variable] = value;
			dModel.refresh();
		},

		//Set Core Value
		setCoreValue: function (that, HeaderName, Variable, value) {
			var dModel = that.getCoreModel("dm");
			dModel.getData()[HeaderName][Variable] = value;
			dModel.refresh();
		},

		// Set Core pm Model
		setCorePmModel: function (that, HeaderName, subHeader, element, value) {

			var pModel = that.getCoreModel("pm");
			pModel.getData()[HeaderName][subHeader][element] = value;
			pModel.refresh();

		},

		//Set Element Value
		setElementValue: function (that, elementName, value) {
			that.getView().getElementBinding().getModel().mChangedEntities["SmartFieldSet('1')"][elementName] = value;
		},

		//Get Element Value
		getElementValue: function (that, elementName) {
			return that.getView().getElementBinding().getModel().mChangedEntities["SmartFieldSet('1')"][elementName];
		},

		// //GET Visibility
		getVisibility: function (that, area, Variable) {
			var pModel = that.getOModel(that, "pm");
			return pModel.getData()["visibles"][area][Variable];
		},

		//SET Visibility
		setVisibility: function (that, area, Variable, value) {
			var dModel = that.getOModel(that, "pm");
			dModel.getData()["visibles"][area][Variable] = value;
			dModel.refresh();
		},

		//SET Editibility
		setEditibility: function (that, Variable, value) {
			var dModel = that.getOModel(that, "pm");
			dModel.getData()["editable"][Variable] = value;
			dModel.refresh();
		},

		setLabel: function (that, variable, bundleName) {
			var pModel = that.getOModel(that, "pm");
			var i18n = that.getView().getModel("i18n").getResourceBundle();
			var text = i18n.getText(bundleName);

			pModel.getData()["Label"][variable] = text;
			pModel.refresh();
		},

		getViewThat: function () {

			return this._that;

		},

		resetSmartField: function (that) {
			debugger;
			that.getView().getElementBinding().getModel().mChangedEntities["SmartFieldSet('1')"] = {};
			that.getView().getElementBinding().getModel().refresh();

			that.setElementValue(that, "Ekgrp", " ");
			that.setElementValue(that, "Teklifkarsilastirmastatu", " ");

			// if (that.getView().getElementBinding().getModel().mChangedEntities["SmartFieldSet('1')"]) {
			// 	Object.keys(that.getView().getElementBinding().getModel().mChangedEntities["SmartFieldSet('1')"]).forEach(function (element) {

			// 		if (element !== '__metadata')
			// 			that.getView().getElementBinding().getModel().mChangedEntities["SmartFieldSet('1')"][element] = "";

			// 	});

			// 	// that.getView().getElementBinding().getModel().refresh();
			// }


			// this.setElementValue(that, "LogisticsTeam", '');
			// this.setElementValue(that, "LogisticsSubTeam", '');
			// this.setElementValue(that, "LogisticsResponsible", '');

		},

		clearMessages: function (that) {
			var mModel = that.getOModel(that, "message");
			if (mModel) {
				mModel.oData = [];
				mModel.refresh();
			}
			that.MessagePopover = sap.ui.getCore().getMessageManager();
			that.MessagePopover.removeAllMessages();
		},

	});
});
