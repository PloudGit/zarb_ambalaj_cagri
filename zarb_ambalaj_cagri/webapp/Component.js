sap.ui.define([
    "sap/ui/core/UIComponent",
    "com/app/abdiibrahim/zarbambalajcagri/model/models"
], (UIComponent, models) => {
    "use strict";

    return UIComponent.extend("com.app.abdiibrahim.zarbambalajcagri.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // enable routing
            this.getRouter().initialize();

            this._loadXLSXLibrary();
        },
        _loadXLSXLibrary: function () {
            const sUrl = "https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js";

            jQuery.ajax({
                url: sUrl,
                dataType: "script",
                success: function () {
                    console.log("XLSX kütüphanesi yüklendi.");
                },
                error: function () {
                    console.error("XLSX kütüphanesi yüklenemedi.");
                }
            });
        }

    });
});