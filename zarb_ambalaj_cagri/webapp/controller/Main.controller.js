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

            this._main.setFileUploaderConfig(this, "excelUploader");
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

        onSave: function (oEvent) {
            debugger;
            var that = this;
            that._main.checkData(that, 'B');

        },

        _validateSelection: function (that, tableId) {

            var oTable = (tableId === "mainTable")
                ? that.byId(tableId)
                : sap.ui.getCore().byId(tableId);

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

        _getSelectedRowData: function (that, index, tableId) {
            var oTable = (tableId === "mainTable")
                ? that.byId(tableId)
                : sap.ui.getCore().byId(tableId);

            var oContext = oTable.getContextByIndex(index);
            return oContext ? oContext.getObject() : null;
        },

        _setSelectedRow: function (that, oRowData, tableId) {
            var dModel = that.getOModel(that, "dm");

            var sProperty = (tableId === "mainTable")
                ? "/selectedRow"
                : "/selectedRowCallList"

            dModel.setProperty(sProperty, oRowData);
        },

        onCallList: function (oEvent) { // ÇAğrı Listesi 

            var that = this;
            var index = that._validateSelection(that, "mainTable");
            if (index === null) {
                return;
            }

            var oRowData = that._getSelectedRowData(that, index, "mainTable");
            if (!oRowData) {
                return;
            }

            that._setSelectedRow(that, oRowData, "mainTable");

            that._oData.getCallList(that);


        },

        onChange: function () {
            var that = this;
            var index = that._validateSelection(that, "callListTable");
            if (index === null) {
                return;
            }

            var oRowData = that._getSelectedRowData(that, index, "callListTable");
            if (!oRowData) {
                return;
            }

            that._setSelectedRow(that, oRowData, "callListTable");

            // default
            var editableSettings = {
                TermItemNum: false,
                Quantity: true,
                Unit: false,
                DeliveryDate: false,
                FirmDelivery: true,
                PrintCode: true,
                ReviseNote: true,
                CancelNote: false
                // BtnRevise: true
            };

            if (oRowData.BtnChange === false) { // 
                editableSettings.Quantity = false;
                editableSettings.FirmDelivery = false;
                editableSettings.PrintCode = false;
                editableSettings.ReviseNote = false;
                // editableSettings.BtnRevise = false;
            }

            var pModel = that.getOModel(that, "pm");
            pModel.setProperty("/popup", {
                title: that.getResourceBundle().getText("popupReviseCallTitle"),
                action: "change",
                fields: {
                    TermItemNum: { visible: true, editable: editableSettings.TermItemNum },
                    Quantity: { visible: true, editable: editableSettings.Quantity },
                    Unit: { visible: true, editable: editableSettings.Unit },
                    DeliveryDate: { visible: true, editable: editableSettings.DeliveryDate },
                    FirmDelivery: { visible: true, editable: editableSettings.FirmDelivery },
                    PrintCode: { visible: true, editable: editableSettings.PrintCode },
                    ReviseNote: { visible: true, editable: editableSettings.ReviseNote },
                    CancelNote: { visible: false, editable: editableSettings.CancelNote }
                    // BtnRevise: { enabled: editableSettings.BtnRevise }
                }
            });
            var dModel = that.getOModel(that, "dm");
            dModel.setProperty("/ReviseNote", "");

            that._callPopup().open();

        },

        onAddNewCall: function () {
            var that = this;

            var dModel = that.getOModel(that, "dm");
            var dData = dModel.getData();

            var selectedRow = dData["selectedRow"];
            var callList = dData["CallList"] || [];

            // inputtaki değeri kaydedince cacheliyor o yüzden sıfırlayalım.
            var callMengeInput = sap.ui.getCore().byId("callMenge");
            if (callMengeInput) {
                callMengeInput.setValue("0");
            }
            // dModel.setProperty("/selectedRowCallList/Menge", "0");

            let maxEtenr = 0;
            callList.forEach(item => {
                const etenr = parseInt(item.Etenr, 10);
                if (!isNaN(etenr) && etenr > maxEtenr) {
                    maxEtenr = etenr;
                }
            });

            const newEtenr = (maxEtenr + 1).toString();

            const item = {
                Ebeln: selectedRow.Ebeln,
                Eindt: selectedRow.Eindt,
                Meins: selectedRow.Meins,
                Ebelp: selectedRow.Ebelp,
                Etenr: newEtenr,
                Logsy: selectedRow.Logsy,
                ApKey: selectedRow.ApKey,
                Menge: "0",
                // Slfdt: selectedRow.Slfdt,
                Slfdt: that.formatters.adjustStartDateForUTC(selectedRow.Slfdt),
                Normt: selectedRow.Matnr + "-" + newEtenr, // A200000999-1 .. şeklinde olsu n
                Lifnr: selectedRow.Lifnr,
                Matnr: selectedRow.Matnr
            };

            dModel.setProperty("/selectedRowCallList", item);
            dModel.refresh();

            var editableSettings = {
                TermItemNum: false,
                Quantity: true,
                Unit: false,
                DeliveryDate: false,
                FirmDelivery: true,
                PrintCode: true,
                ReviseNote: false,
                CancelNote: false
            };


            var pModel = that.getOModel(that, "pm");
            pModel.setProperty("/popup", {
                title: this.getResourceBundle().getText("popupAddNewCallTitle"),
                action: "add",
                fields: {
                    TermItemNum: { visible: true, editable: editableSettings.TermItemNum },
                    Quantity: { visible: true, editable: editableSettings.Quantity },
                    Unit: { visible: true, editable: editableSettings.Unit },
                    DeliveryDate: { visible: true, editable: editableSettings.DeliveryDate },
                    FirmDelivery: { visible: true, editable: editableSettings.FirmDelivery },
                    PrintCode: { visible: true, editable: editableSettings.PrintCode },
                    ReviseNote: { visible: false, editable: editableSettings.ReviseNote },
                    CancelNote: { visible: false, editable: editableSettings.CancelNote }
                }
            });

            // Popup'ı aç
            that._callPopup().open();
        },

        onCancelCall: function () {
            var that = this;

            // satır seçimi kontrolü
            var index = that._validateSelection(that, "callListTable");
            if (index === null) {
                return;
            }

            var oRowData = that._getSelectedRowData(that, index, "callListTable");
            if (!oRowData) {
                return;
            }

            that._setSelectedRow(that, oRowData, "callListTable");

            var editableSettings = {
                TermItemNum: false,
                Quantity: false,
                Unit: false,
                DeliveryDate: false,
                FirmDelivery: false,
                PrintCode: false,
                ReviseNote: false,
                CancelNote: true
            };

            if (oRowData.BtnCancel === false) {
                editableSettings.CancelNote = false;
            }

            var pModel = that.getOModel(that, "pm");
            pModel.setProperty("/popup", {
                title: that.getResourceBundle().getText("popupCancelCallTitle"),
                action: "cancel",
                fields: {
                    TermItemNum: { visible: true, editable: editableSettings.TermItemNum },
                    Quantity: { visible: true, editable: editableSettings.Quantity },
                    Unit: { visible: true, editable: editableSettings.Unit },
                    DeliveryDate: { visible: true, editable: editableSettings.DeliveryDate },
                    FirmDelivery: { visible: true, editable: editableSettings.FirmDelivery },
                    PrintCode: { visible: true, editable: editableSettings.PrintCode },
                    ReviseNote: { visible: false, editable: editableSettings.ReviseNote },
                    CancelNote: { visible: true, editable: editableSettings.CancelNote }
                }
            });

            // CancelNote alanını temizle
            var dModel = that.getOModel(that, "dm");
            dModel.setProperty("/CancelNote", "");

            // Popup'ı aç
            that._callPopup().open();
        },

        // onSelectionChange: function (oEvent) {
        //     debugger;
        //     var that = this;
        //     var oTable = oEvent.getSource();
        //     var selectedIndex = oTable.getSelectedIndex();

        //     if (selectedIndex < 0) {
        //         return;
        //     }

        //     var oContext = oTable.getContextByIndex(selectedIndex);
        //     if (!oContext) {
        //         return;
        //     }

        //     var oRowData = oContext.getObject();

        //     // Seçilen satır verisini set et (örneğin onChange içinde kullanılacaksa)
        //     that._setSelectedRow(that, oRowData, "callListTable");

        //     that.setButtonStates(that, oRowData.BtnCreate);
        // },

        // setButtonStates: function (that, btnNewCall) {

        //     var pModel = that.getOModel(that, "pm");

        //     pModel.setProperty("/buttons", {
        //         btnAddNewCallEnabled: btnNewCall
        //     });
        // },

        getResourceBundle: function () {
            return this.getView().getModel("i18n").getResourceBundle();
        },


        _callListPopup: function () {


            var that = this;

            if (!that.CallListPopup) {

                that.CallListPopup = sap.ui.xmlfragment("com.app.abdiibrahim.zarbambalajcagri.view.fragments.CallListPopup", that);

                that.CallListPopup.setModel(that.getView().getModel());

                that.getView().addDependent(that.CallListPopup);

                jQuery.sap.syncStyleClass("sapUiSizeCompact", that.getView(), that.CallListPopup);

            }
            return that.CallListPopup;
        },

        onCloseCallListPopup: function () {
            if (this.CallListPopup) {
                this.CallListPopup.close();
            }
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
                this._oData.getCallList(this);
                this.CallPopup.close();
            }
        },


        // C	Çağrı Oluştur
        // U	Çağrı Güncelle
        // D	Çağrı Sil
        // B	Toplu Çağrı Oluştur
        // Q	Kota Kontrolü

        onConfirmAdd: function (oEvent) {
            debugger;
            var that = this;
            that._main.checkData(that, 'C');

        },

        onConfirmChange: function (oEvent) {
            var that = this;
            that._main.checkData(that, 'U');

        },

        onConfirmCancel: function (oEvent) {
            var that = this;
            that._main.checkData(that, 'D');

        },

        onConfirmResponse: function (that, response, action) {
            debugger;

            var dModel = that.getOModel(that, "dm");
            var dData = dModel.getData();

            if (action !== 'B' && action !== 'EXCEL_UPLOAD') {
                const row = dModel.getProperty("/selectedRowCallList");
                var callMenge = sap.ui.getCore().byId("callMenge").mProperties["value"];
                callMenge = callMenge.replace(".", "").replace(",", ".");

                const item = {
                    Ebeln: row.Ebeln,
                    Eindt: row.Eindt,
                    Meins: row.Meins,
                    Ebelp: row.Ebelp,
                    Etenr: row.Etenr,
                    Logsy: row.Logsy,
                    ApKey: row.ApKey,
                    Menge: callMenge,
                    // Slfdt: row.Slfdt,
                    Slfdt: that.formatters.adjustStartDateForUTC(row.Slfdt),
                    Normt: row.Normt,
                    Lifnr: row.Lifnr
                };

                var data = {
                    "Ebeln": row.Ebeln,
                    "Ebelp": row.Ebelp,
                    "Logsy": row.Logsy,
                    "ApKey": row.ApKey,
                    "ReviseNote": dData["ReviseNote"],
                    "CancelNote": dData["CancelNote"],
                    "ToCgrItems": [item]
                };
            }
            if (response == 'OK') {
                debugger;
                switch (action) {
                    case 'C':

                        // tekli create işlemi 
                        debugger;
                        // var data = dModel.getProperty("/checkedTrueCallData");
                        data.Action = 'C';
                        that._oData.approveProcess(that, data);

                        break;
                    case 'U':

                        data.Action = 'U';
                        data.ToCgrItems[0].Desc = dData["ReviseNote"];
                        that._oData.approveProcess(that, data);

                        break;
                    case 'D':

                        data.Action = 'D';
                        data.ToCgrItems[0].Desc = dData["CancelNote"];
                        that._oData.approveProcess(that, data);

                        break;
                    case 'B':
                        var checkedData = dModel.getProperty("/checkedTrueCallData");
                        checkedData.Action = 'B';
                        that._oData.approveProcess(that, checkedData);
                        break;
                    case 'Q':


                        break;

                    case "EXCEL_UPLOAD":
                        that._processExcelFile(that);
                        break;

                    default:
                        break;
                }


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
        },
        // EXCEL İŞLEMLERİ    

        // EXCEL UPLOAD İŞLEMLERİ 
        onUploadExcel: function () {
            const that = this;
            debugger;
            const oUploader = that.getView().byId("excelUploader");

            // const aFiles = oUploader.getFocusDomRef()?.files;
            const aFiles = oUploader.getDomRef("fu")?.files;

            if (!aFiles || aFiles.length === 0) {
                that.showMessage("error", "errorNoExcelFile");
                return;
            }

            that.confirmMessageWithActonResponse(
                that,
                "confirmUploadExcel",
                that.onConfirmResponse,
                "EXCEL_UPLOAD"
            );
        },
        _processExcelFile: function (that) {
            debugger
            const oUploader = that.getView().byId("excelUploader");
            const file = oUploader.getDomRef("fu")?.files?.[0];

            if (!file) {
                that.showMessage("error", "errorNoExcelFile");
                return;
            }

            const reader = new FileReader();

            reader.onload = function (e) {
                try {
                    const data = e.target.result;
                    const workbook = XLSX.read(data, { type: "binary" });

                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                        defval: "",
                        header: 0
                    });

                    if (jsonData.length === 0) {
                        that.showMessage("error", "errorExcelEmpty");
                        return;
                    }

                    that._mapExcelDataToTable(that, jsonData);

                } catch (err) {
                    console.error("Excel okuma hatası:", err);
                    that.showMessage("error", "errorReadingExcel");
                    oUploader.setValue("");

                }
            };

            reader.readAsBinaryString(file);
        },

        _mapExcelDataToTable: function (that, excelData) {
            debugger;
            const dModel = that.getView().getModel("dm");
            const oBundle = that.getView().getModel("i18n").getResourceBundle();
            const tableData = dModel.getProperty("/OrderList");

            const sasHeader = oBundle.getText("sasNumber");
            const kalemHeader = oBundle.getText("itemNumber");
            const printHeader = oBundle.getText("printCode");

            excelData.forEach((excelRow) => {
                const sasNo = excelRow[sasHeader]?.toString().padStart(10, "0");
                const kalemNo = excelRow[kalemHeader]?.toString().padStart(5, "0");

                const matchedRow = tableData.find(
                    (row) => row.Ebeln === sasNo && row.Ebelp === kalemNo && row.RestMenge !== "0.000"
                );

                if (matchedRow) {
                    matchedRow.Normt = excelRow[printHeader];
                }
            });

            dModel.refresh();

            that.showMessage("success", "excelAppliedToTable");
            that.getView().byId("excelUploader").setValue("");
        },

        onFileChange: function (oEvent) {
            debugger;
            const oUploader = oEvent.getSource();
            const file = oUploader.getDomRef("fu")?.files?.[0];
            const that = this;

            if (!file) {
                return;
            }

            const reader = new FileReader();

            reader.onload = function (e) {
                try {
                    const data = e.target.result;
                    const workbook = XLSX.read(data, { type: "binary" });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                        defval: "",
                        header: 0
                    });

                    if (!that._validateExcelData(jsonData)) {
                        // that.showMessage("error", "errorInvalidExcelFormat");
                        that.getView().byId("excelUploader").setValue("");
                    }
                } catch (err) {
                    console.error("Dosya kontrol hatası:", err);
                    that.showMessage("error", "errorReadingExcel");
                    that.getView().byId("excelUploader").setValue("");
                }
            };

            reader.readAsBinaryString(file);
        },
        _validateExcelData: function (data) {
            const that = this;
            const oBundle = that.getView().getModel("i18n").getResourceBundle();

            if (!data || data.length === 0) {
                that.showMessage("error", "errorExcelEmpty");
                return false;
            }

            const requiredFields = [
                oBundle.getText("sasNumber"),
                oBundle.getText("itemNumber"),
                oBundle.getText("printCode")
            ];

            const missingColumns = requiredFields.filter(f => !Object.keys(data[0]).includes(f));

            if (missingColumns.length > 0) {
                const sText = oBundle.getText("errorExcelMissingColumns", [missingColumns.join(", ")]);
                that.showMessage("error", sText);
                return false;
            }

            const invalidRows = data.filter(row =>
                !row[oBundle.getText("sasNumber")] ||
                !row[oBundle.getText("itemNumber")]
            );

            if (invalidRows.length > 0) {
                that.showMessage("error", oBundle.getText("errorExcelMissingValues"));
                return false;
            }



            return true;
        }





    });
});
