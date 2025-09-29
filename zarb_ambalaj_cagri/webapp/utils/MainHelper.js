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

                    // // Clear butonu
                    // if (oFB._oClearButtonOnFB) {
                    //     oFB._oClearButtonOnFB.setType(sap.m.ButtonType.Transparent);
                    //     oFB._oClearButtonOnFB.addStyleClass("redButton");
                    // }

                    // // Restore Filters butonu
                    // if (oFB._oRestoreButtonOnFB) {
                    //     oFB._oRestoreButtonOnFB.setType(sap.m.ButtonType.Transparent);
                    //     oFB._oRestoreButtonOnFB.addStyleClass("redButton");
                    // }

                    // // Show All Filters butonu
                    // if (oFB._oShowAllFiltersButton) {
                    //     oFB._oShowAllFiltersButton.setType(sap.m.ButtonType.Transparent);
                    //     oFB._oShowAllFiltersButton.addStyleClass("redButton");
                    // }

                    debugger;
                }
            });
        },


        checkData: function (that, action) {

            var dModel = that.getOModel(that, "dm");
            var dData = dModel.getData();

            var callValues = dData["selectedRowCallList"];
            var orderList = dData["OrderList"]

            var oBundle = that.getResourceBundle();

            switch (action) {
                case 'C':

                    var requiredFields = {
                        Menge: "quantity",
                        // Meins: "unit",
                        // Eindt: "deliveryDate",
                        Slfdt: "firmDeliveryDate",
                        Normt: "printCode"
                    };

                    var missingLabels = [];

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

                    that.confirmMessageWithActonResponse(that, "confirmUpdate", that.onConfirmResponse, 'U');

                    break;
                case 'D':

                    that.confirmMessageWithActonResponse(that, "confirmDelete", that.onConfirmResponse, 'D');

                    break;
                case 'B':

                    var missingMessages = [];

                    orderList.forEach(function (row, index) {
                        var rowMissing = [];

                        if (!row.Normt || row.Normt.toString().trim() === "") {
                            rowMissing.push(oBundle.getText("printCode")); // i18n key
                        }
                        if (!row.Slfdt || row.Slfdt.toString().trim() === "") {
                            rowMissing.push(oBundle.getText("firmDeliveryDate"));
                        }

                        if (rowMissing.length > 0) {
                            // Satır bilgisini da ekle (ör. sıra numarası + kolon adları)
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


        }


    });
});