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
        }


    });
});