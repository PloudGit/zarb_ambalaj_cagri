sap.ui.define([
    "sap/ui/base/ManagedObject",
    "sap/m/MessageBox",
    "sap/m/BusyDialog",
    "sap/m/HBox",
    "sap/m/VBox",
    "sap/m/Text",
    "sap/m/Table",
    "com/app/abdiibrahim/zarbambalajcagri/utils/formatter",
], function (
    ManagedObject,
    MessageBox,
    BusyDialog,
    HBox,
    VBox,
    Text,
    Table,
    formatter
) {
    "use strict";

    return ManagedObject.extend("com.app.abdiibrahim.zarbambalajcagri.utils.MainHelper", {

        formatters: formatter,
        setFilterBar: function (that, id) {
            var oFilter = that.getView().byId(id);

            if (!oFilter) {
                console.error("FilterBar bulunamadı:", id);
                return;
            }

            oFilter.addEventDelegate({
                onAfterRendering: function (oEvent) {
                    var oFB = oEvent.srcControl;
                    var oResourceBundle = that.getOwnerComponent().getModel("i18n").getResourceBundle();

                    if (oFB._oSearchButton) {
                        oFB._oSearchButton.setText(oResourceBundle.getText("goButtonText"));
                        oFB._oSearchButton.setIcon("sap-icon://search");
                        oFB._oSearchButton.setIconFirst(true);
                        oFB._oSearchButton.setType(sap.m.ButtonType.None);
                        oFB._oSearchButton.addStyleClass("greenButton");
                    }

                    if (oFB._oFiltersButton) {
                        oFB._oFiltersButton.setType(sap.m.ButtonType.Transparent);
                        oFB._oFiltersButton.addStyleClass("blueButton");
                    }

                    if (oFB._oHideShowButton) {
                        oFB._oHideShowButton.setType(sap.m.ButtonType.Transparent);
                        oFB._oHideShowButton.addStyleClass("yellowButton");
                    }

                    // custom buton
                    var oToolbar = oFB.getToolbar ? oFB.getToolbar() : oFB._oToolbar;
                    if (oToolbar && !oFB._bCustomButtonAdded) {
                        oFB._bCustomButtonAdded = true;

                        oToolbar.addContent(
                            new sap.m.Button({
                                text: "Ambalaj Portaline Git",
                                icon: "sap-icon://customer-view",
                                press: that._main.onOpenAmbalajPortali.bind(that)
                            }).addStyleClass("redButton sapUiSmallMarginLeft")
                        );

                    }

                

                    debugger;
                }
            });
        },

        setFileUploaderConfig: function (that, id) {

            var oUploader = that.getView().byId("excelUploader");
            oUploader.addEventDelegate({
                onAfterRendering: function () {
                    // Uploader içindeki gerçek DOM'dan butonu bul
                    var sUploaderId = oUploader.getId();
                    var $button = $("#" + sUploaderId).find("button");

                    if ($button && $button.length > 0) {
                        $button.addClass("blueButton");
                    }
                }
            }, oUploader);

        },
        checkData: function (that, action) {

            var dModel = that.getOModel(that, "dm");
            var dData = dModel.getData();
            var callMengeInput = null;
            if (action !== 'B') {
                var callMengeField = sap.ui.getCore().byId("callMenge");
                if (callMengeField) {
                    callMengeInput = callMengeField.getValue();
                }
            }

            var callValues = dData["selectedRowCallList"];
            var selectedRow = dData["selectedRow"];
            var cancelNote = dData["CancelNote"];
            var reviseNote = dData["ReviseNote"];
            var orderList = dData["OrderList"]
            debugger;
            var oBundle = that.getResourceBundle();

            switch (action) {
                case 'C':
                    var printkodMandatory = !!selectedRow.PrintkodMandatory; // !! işareti JavaScript’te “değeri kesin boolean’a çevir” demek. Yani callValues.PrintkodMandatory ne gelirse gelsin ("X", 1, "true", null, undefined vs.) sonucu true/false yapar.

                    var requiredFields = {
                        Menge: "quantity",
                        Slfdt: "firmDeliveryDate"
                    };

                    // printkod zorunluysa listeye ekle
                    if (printkodMandatory) {
                        requiredFields.Normt = "printCode";
                    }

                    var missingLabels = [];
                    if (callMengeInput === "0") {
                        missingLabels.push(oBundle.getText(requiredFields["Menge"]));
                    }
                    debugger;
                    Object.keys(requiredFields).forEach(function (field) {
                        if (!callValues[field] || callValues[field].toString().trim() === "") {
                            missingLabels.push(oBundle.getText(requiredFields[field]));
                        }
                    });

                    if (missingLabels.length > 0) {
                        MessageBox.error(
                            oBundle.getText("missing_fields_msg") + "\n\n" + missingLabels.join(", "),
                            {
                                title: oBundle.getText("missing_fields_title"),
                                actions: [MessageBox.Action.OK],
                                emphasizedAction: MessageBox.Action.OK
                            }
                        );
                        return;
                    }
                    debugger;
                    if (printkodMandatory) {  // printkod zorunlu ise 
                        //printCode içinde malzeme kodu geçiyor mu
                        var materialCode = callValues.Matnr || "";
                        var printCode = callValues.Normt || "";

                        if (printCode.length > 18) {
                            MessageBox.error(
                                oBundle.getText("printcode_maxlength_exceeded"),
                                {
                                    title: oBundle.getText("missing_fields_title"),
                                    actions: [MessageBox.Action.OK],
                                    emphasizedAction: MessageBox.Action.OK
                                }
                            );
                            return;
                        }

                        if (!printCode.includes(materialCode)) {
                            MessageBox.error(
                                oBundle.getText("printcode_material_mismatch"), // <-- i18n key
                                {
                                    title: oBundle.getText("missing_fields_title"),
                                    actions: [MessageBox.Action.OK],
                                    emphasizedAction: MessageBox.Action.OK
                                }
                            );
                            return;
                        }
                    }
                    // geçmiş tarih kontrolü
                    var today = new Date();
                    today.setHours(0, 0, 0, 0); // sadece tarih karşılaştır

                    // TODO: Aşağıdaki kod parçası test için yoruma alındı. Geri açılacak.
                    if (callValues.Slfdt) {
                        var slfdt = new Date(callValues.Slfdt);
                        slfdt.setHours(0, 0, 0, 0);

                        if (slfdt < today) {
                            MessageBox.error(
                                oBundle.getText("slfdat_not_before_today"),
                                {
                                    title: oBundle.getText("missing_fields_title"),
                                    actions: [MessageBox.Action.OK],
                                    emphasizedAction: MessageBox.Action.OK
                                }
                            );
                            return;
                        }
                    }

                    // Kota kontrolü → dönen değere göre davran
                    that._oData.checkQuota(that).then(function (quotaOk) {
                        if (quotaOk === true) {
                            that.confirmMessageWithActonResponse(that, "confirmAdd", that.onConfirmResponse, 'C'); // Çağrı Oluştur
                        } else {
                            return;
                        }
                    });


                    break;
                case 'U':
                    if (!reviseNote || reviseNote.toString().trim() === "") {
                        MessageBox.error(
                            oBundle.getText("revise_note_required_msg"), // <-- i18n key, bunu i18n dosyana eklemelisin
                            {
                                title: oBundle.getText("missing_fields_title"),
                                actions: [MessageBox.Action.OK],
                                emphasizedAction: MessageBox.Action.OK
                            }
                        );
                        return;
                    }
                    that.confirmMessageWithActonResponse(that, "confirmUpdate", that.onConfirmResponse, 'U');

                    break;
                case 'D':

                    if (!cancelNote || cancelNote.toString().trim() === "") {
                        MessageBox.error(
                            oBundle.getText("cancel_note_required_msg"), // <-- i18n key, bunu i18n dosyana eklemelisin
                            {
                                title: oBundle.getText("missing_fields_title"),
                                actions: [MessageBox.Action.OK],
                                emphasizedAction: MessageBox.Action.OK
                            }
                        );
                        return;
                    }


                    that.confirmMessageWithActonResponse(that, "confirmDelete", that.onConfirmResponse, 'D');

                    break;
                case 'B':

                    var missingMessages = [];

                    orderList.forEach(function (row, index) {
                        var rowMissing = [];

                        var printkodMandatory = row.PrintkodMandatory === true;

                        if (printkodMandatory && row.RestMenge !== "0.000" && (!row.Normt || row.Normt.toString().trim() === "")) {
                            rowMissing.push(oBundle.getText("printCode"));
                        }

                        if (!row.Slfdt || row.Slfdt.toString().trim() === "") {
                            rowMissing.push(oBundle.getText("firmDeliveryDate"));
                        }

                        if (printkodMandatory) {
                            // printkod uzunluk kontrolü
                            if (row.Normt && row.Normt.length > 18) {
                                rowMissing.push(oBundle.getText("printcode_maxlength_exceeded"));
                            }
                            // printkod kontrolü 
                            if (row.Normt && row.Matnr && !row.Normt.includes(row.Matnr)) {
                                rowMissing.push(oBundle.getText("printcode_material_mismatch"));
                            }
                        }

                        if (rowMissing.length > 0) {
                            missingMessages.push(
                                oBundle.getText("row_label", [index + 1]) + ": " + rowMissing.join(", ")
                            );
                        }
                    });

                    if (missingMessages.length > 0) {
                        MessageBox.error(
                            oBundle.getText("missing_fields_msg") + "\n\n" + missingMessages.join("\n"),
                            {
                                title: oBundle.getText("missing_fields_title"),
                                actions: [MessageBox.Action.OK],
                                emphasizedAction: MessageBox.Action.OK
                            }
                        );
                        return;
                    }
                    // Geçmiş tarih kontrolü (toplu)
                    var today = new Date();
                    today.setHours(0, 0, 0, 0); // sadece tarih karşılaştır

                    var pastDateMessages = [];

                    orderList.forEach((element, index) => {
                        if (element.RestMenge !== "0.000" && element.Slfdt) {
                            var slfdt = new Date(element.Slfdt);
                            slfdt.setHours(0, 0, 0, 0);

                            if (slfdt < today) {
                                pastDateMessages.push(
                                    oBundle.getText("row_label", [index + 1]) + ": " + oBundle.getText("slfdat_not_before_today")
                                );
                            }
                        }
                    });

                    // Varsa hatalı tarihleri göster
                    if (pastDateMessages.length > 0) {
                        MessageBox.error(
                            oBundle.getText("missing_fields_msg") + "\n\n" + pastDateMessages.join("\n"),
                            {
                                title: oBundle.getText("missing_fields_title"),
                                actions: [MessageBox.Action.OK],
                                emphasizedAction: MessageBox.Action.OK
                            }
                        );
                        return;
                    }

                    that._oData.checkQuotaAll(that).then(function (quotaOk) {
                        if (quotaOk === true) {
                            that.confirmMessageWithActonResponse(that, "confirmMultiAdd", that.onConfirmResponse, 'B');
                        } else {
                            return;
                        }
                    });



                    break;
                case 'Q':


                    break;
                default:
                    break;
            }

        },


        approveSuccessInformation: function (that, data) {
            var i18n = that.getView().getModel("i18n").getResourceBundle();
            var successTitle = i18n.getText("Success");
            var dModel = that.getOModel(that, "dm");
            var oSmartFilterBar = that.byId("smartFilterBar");

            if (data.Action === 'B') {
                // Toplu çağrı - OrderList yeniden yüklenecek
                MessageBox.success(i18n.getText("bulkCallCreatedSuccessfully"), {
                    title: successTitle,
                    onClose: function () {
                        if (oSmartFilterBar) {
                            var aFilters = oSmartFilterBar.getFilters();
                            that._oData.getOrderList(that, aFilters);
                        }
                    }
                });
            } else {
                debugger;
                if (data.ToCgrItems.results && data.ToCgrItems.results.length > 0) {
                    var newRestMenge = data.ToCgrItems.results[0].RestMenge;

                    var dModel = that.getOModel(that, "dm");
                    var oSelectedRow = dModel.getProperty("/selectedRow");

                    if (oSelectedRow) {
                        var aOrderList = dModel.getProperty("/OrderList") || [];

                        for (var i = 0; i < aOrderList.length; i++) {
                            var oItem = aOrderList[i];

                            if (oItem.Ebeln === oSelectedRow.Ebeln && oItem.Ebelp === oSelectedRow.Ebelp) {
                                oItem.RestMenge = newRestMenge;
                                if (!oItem.Normt || oItem.Normt === "") { // normt yoksa oluşan değeri buraya yazalım 
                                    oItem.Normt = data.ToCgrItems.results[0].Normt;
                                }

                                dModel.setProperty("/OrderList", aOrderList);
                                break;
                            }
                        }

                    }
                }

                // Diğer tüm aksiyonlar - Popup kapat, CallList'i yenile
                if (that.CallPopup) {
                    that.CallPopup.close();
                }

                MessageBox.success(i18n.getText("processSuccesfullyDone"), {
                    title: successTitle,
                    onClose: function () {
                        that._oData.getCallList(that);
                    }
                });
            }
        },

        onOpenAmbalajPortali: function (that) {
            debugger;

            var systemId;
            if (sap.ushell) {
                systemId = sap.ushell.Container.getLogonSystem("system").getName();
            } else {
                systemId = "DS4";
            }

            var url;
            if (systemId === "DS4") {
                // url = i18n.getText("urlCallDev");
                url = "https://vhvctds4ci.sap.abdiibrahim.com.tr:44300/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html?sap-client=100&sap-language=TR#ZARB_AMBALAJP-manage";
            }
            else if (systemId === "QS4") {
                // url = i18n.getText("urlCallQa");
                url = "https://vhvctqs4ci.sap.abdiibrahim.com.tr:44300/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html?sap-client=100&sap-language=TR#ZARB_AMBALAJP-manage";

            }
            else if (systemId === "PS4") {
                // url = i18n.getText("urlCallProd");
                url = "https://vhvctps4ci.sap.abdiibrahim.com.tr:44300/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html?sap-client=100&sap-language=TR#ZARB_AMBALAJP-manage";

            }

            sap.ui.require(["sap/m/library"], function (library) {
                var URLHelper = library.URLHelper;
                URLHelper.redirect(url, false);
            });
        },






    });
});