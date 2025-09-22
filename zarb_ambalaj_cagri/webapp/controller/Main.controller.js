sap.ui.define([
    "com/app/abdiibrahim/zarbambalajcagri/controller/BaseController",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "com/app/abdiibrahim/zarbambalajcagri/utils/DataModel",
    "com/app/abdiibrahim/zarbambalajcagri/utils/ODataController",
    "com/app/abdiibrahim/zarbambalajcagri/utils/MainHelper",
    "com/app/abdiibrahim/zarbambalajcagri/utils/Mapping",
    "com/app/abdiibrahim/zarbambalajcagri/utils/formatter",
    "sap/ui/model/BindingMode",
    "sap/ui/export/Spreadsheet",
    "sap/m/HBox",
    "sap/m/VBox",
    "sap/m/Text",
    "sap/m/Table"
], function (BaseController,
    Fragment,
    JSONModel,
    DataModel,
    ODataController,
    MainHelper,
    Mapping,
    formatter,
    BindingMode,
    Spreadsheet,
    HBox,
    VBox,
    Text,
    Table
) {
    "use strict";

    return BaseController.extend("com.app.abdiibrahim.zarbambalajcagri.controller.Main", {
        formatters: formatter,
        oJSONModel: new JSONModel(),

        onInit: function (oEvent) {
            this._Router = this.getOwnerComponent().getRouter();
            this._Router.getRoute("Main").attachMatched(this._onRouteMatched, this);
            // this._Router.getRoute("Display").attachMatched(this._onRouteMatchedDisplay, this);

            //Datamodel js 
            this._dataModel = new DataModel();

            //oData Controller
            this._oData = new ODataController();

            // MainHelper.js
            this._main = new MainHelper();

            // Mapping.js
            this._mapping = new Mapping();

            // Create Model 
            this._dataModel.createAllModel(this);

            this.setMessagePopover(this);
            var that = this;

            this._main.setFilterBar(this, "smartFilterBar");
        },

        _onRouteMatched: function () {
            // Route matched işlemleri
            var that = this;

            // listeyi al 

        },

        _onRouteMatchedDisplay: function (oEvent) {
            // Route matched işlemleri
            var that = this;


        },

        onAfterRendering: function () {

            var oScroll = this.byId("mainScrollContainer");
            if (oScroll) {
                // Ekran yukarı scroll 
                oScroll.scrollTo(0, 0, 0); // (x, y, duration)
            }
        },

        onExit: function () {
            // Çıkış işlemleri
        },


        onSearch: function (oEvent) {
            debugger;
            var oSmartFilterBar = this.byId("smartFilterBar");

            var aFilters = oSmartFilterBar.getFilters();

            this._oData.getOrderList(this, aFilters);

        },

        _validateSelection: function (that) {
            var oTable = that.byId("mainTable");
            var aSelectedIndices = oTable.getSelectedIndices();

            if (aSelectedIndices.length === 0) {
                that.showMessage("error", "msgNoSelection");
                return null;
            }

            if (aSelectedIndices.length > 1) {
                that.showMessage("error", "msgMultipleSelection");
                return null;
            }

            return aSelectedIndices[0];
        },

        _getSelectedRowData: function (that, index) {
            var oTable = that.byId("mainTable");
            var oContext = oTable.getContextByIndex(index);
            return oContext ? oContext.getObject() : null;
        },

        _setSelectedRow: function (that, oRowData) {
            var dModel = that.getOModel(that, "dm");
            dModel.setProperty("/selectedRow", oRowData);
        },


        onChange: function () {
            var that = this;
            var index = that._validateSelection(that);
            if (index === null) {
                return;
            }

            var oRowData = that._getSelectedRowData(that, index);
            if (!oRowData) {
                return;
            }

            that._setSelectedRow(that, oRowData);

            // pm model state
            var pModel = that.getOModel(that, "pm");
            pModel.setProperty("/popup", {
                title: that.getResourceBundle().getText("popupReviseCallTitle"),
                action: "change",
                fields: {
                    TermItemNum: { visible: true, editable: false },
                    Quantity: { visible: true, editable: true },
                    Unit: { visible: true, editable: false },
                    DeliveryDate: { visible: true, editable: false },
                    FirmDelivery: { visible: true, editable: true },
                    PrintCode: { visible: true, editable: true },
                    ReviseNote: { visible: true, editable: true },
                    CancelNote: { visible: false, editable: false }
                }
            });

            that._callPopup().open();

        },

        onAddNewCall: function () {
            var that = this;
            var index = that._validateSelection(that);
            if (index === null) {
                return;
            }

            var oRowData = that._getSelectedRowData(that, index);
            if (!oRowData) {
                return;
            }

            that._setSelectedRow(that, oRowData);

            var pModel = that.getOModel(that, "pm");
            pModel.setProperty("/popup", {
                title: this.getResourceBundle().getText("popupAddNewCallTitle"),
                action: "add",
                fields: {
                    TermItemNum: { visible: true, editable: false },
                    Quantity: { visible: true, editable: true },
                    Unit: { visible: true, editable: false },
                    DeliveryDate: { visible: true, editable: false },
                    FirmDelivery: { visible: true, editable: true },
                    PrintCode: { visible: true, editable: true },
                    ReviseNote: { visible: false, editable: false },
                    CancelNote: { visible: false, editable: false }
                }
            });

            that._callPopup().open();

        },

        onCancelCall: function () {
            var that = this;
            var index = that._validateSelection(that);
            if (index === null) {
                return;
            }

            var oRowData = that._getSelectedRowData(that, index);
            if (!oRowData) {
                return;
            }

            that._setSelectedRow(that, oRowData);

            var pModel = that.getOModel(that, "pm");
            pModel.setProperty("/popup", {
                title: this.getResourceBundle().getText("popupCancelCallTitle"),
                action: "cancel",
                fields: {
                    TermItemNum: { visible: true, editable: false },
                    Quantity: { visible: true, editable: false },
                    Unit: { visible: true, editable: false },
                    DeliveryDate: { visible: true, editable: false },
                    FirmDelivery: { visible: true, editable: false },
                    PrintCode: { visible: true, editable: false },
                    ReviseNote: { visible: false, editable: false },
                    CancelNote: { visible: true, editable: true }
                }
            });

            that._callPopup().open();

        },

        getResourceBundle: function () {
            return this.getView().getModel("i18n").getResourceBundle();
        },


        _callPopup: function () {


            var that = this;

            if (!that.CallPopup) {

                that.CallPopup = sap.ui.xmlfragment("com.app.abdiibrahim.zarbambalajcagri.view.fragments.CallPopup", that);

                that.CallPopup.setModel(that.getView().getModel());

                that.getView().addDependent(that.CallPopup);

                jQuery.sap.syncStyleClass("sapUiSizeCompact", that.getView(), that.CallPopup);

            }
            return that.CallPopup;
        },

        onClosePopup: function () {
            if (this.CallPopup) {
                this.CallPopup.close();
            }
        },

        // EXCEL İŞLEMLERİ

        onExcelDownloadMainTable: function () {
            var that = this;
            var oTable = this.getView().byId("mainTable");
            var oBinding = oTable.getBinding("rows").oList;

            var i18n = this.getView().getModel("i18n").getResourceBundle();
            var fileName = i18n.getText("orderListExport");

            // Formatlama gerekiyorsa burada map edebilirsin
            var aFormattedData = oBinding.map(function (item) {
                return Object.assign({}, item, {
                    Menge: that.formatters.formatDecimal(item.Menge),
                    Sevkm: that.formatters.formatDecimal(item.Sevkm)
                });
            });

            var aCols = this.createMainTableColumnConfig();

            var oSettings = {
                workbook: {
                    columns: aCols,
                    context: {
                        sheetName: i18n.getText("orderList")
                    }
                },
                dataSource: aFormattedData,
                fileName: fileName
            };

            var oSheet = new sap.ui.export.Spreadsheet(oSettings);
            oSheet.build().finally(function () {
                oSheet.destroy();
            });
        },

        createMainTableColumnConfig: function () {
            var i18n = this.getView().getModel("i18n").getResourceBundle();

            var aCols = [
                {
                    label: i18n.getText("sasNumber"),
                    property: "Ebeln",
                    type: "string",
                    width: 15
                },
                {
                    label: i18n.getText("itemNumber"),
                    property: "Ebelp",
                    type: "string",
                    width: 10
                },
                {
                    label: i18n.getText("materialCode"),
                    property: "Matnr",
                    type: "string",
                    width: 15
                },
                {
                    label: i18n.getText("materialDesc"),
                    property: "Txt01",
                    type: "string",
                    width: 40
                },
                {
                    label: i18n.getText("supplier"),
                    property: "Lifnr",
                    type: "string",
                    width: 15
                },
                {
                    label: i18n.getText("supplierName"),
                    property: "Name1",
                    type: "string",
                    width: 30
                },
                {
                    label: i18n.getText("quantity"),
                    property: "Menge",
                    type: "number",
                    width: 12
                },
                {
                    label: i18n.getText("unit"),
                    property: "Meins",
                    type: "string",
                    width: 8
                },
                {
                    label: i18n.getText("remainingQty"),
                    property: "Sevkm",
                    type: "number",
                    width: 12
                },
                {
                    label: i18n.getText("printCode"),
                    property: "Zdrukodu",
                    type: "string",
                    width: 15
                },
                {
                    label: i18n.getText("firmDeliveryDate"),
                    property: "Eindt",
                    type: "date",
                    width: 15
                },
                {
                    label: i18n.getText("status"),
                    property: "Status",
                    type: "string",
                    width: 15
                },
                {
                    label: i18n.getText("note"),
                    property: "Note",
                    type: "string",
                    width: 50
                }
            ];

            return aCols;
        }
        // EXCEL İŞLEMLERİ        

    });
});
