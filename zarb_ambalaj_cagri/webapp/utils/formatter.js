sap.ui.define([
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/format/NumberFormat"
], function (DateFormat, NumberFormat) {
    "use strict";
    return {

        clearLeaderZeros: function (val) {
            debugger;
            if (val) {

                val = val.replace(/^0+/, '');

            } else if (val === null || val === undefined) {

                val = '';

            }

            return val;

        },



        setMengeFormatter: function (value) {
            debugger;
            if (value && value === '0.000') {
                return '0';
            } else {
                return value;
            }

        },

        // formatStatusClass: function(statKey) {
        // 	debugger;
        //     switch (statKey) {
        //         case "1":
        //             return "status-begin";
        //         case "2":
        //             return "status-progress";
        //         case "3":
        //             return "status-rejected";
        //         case "4":
        //             return "status-waiting";
        //         case "5":
        //             return "status-completed";
        //         default:
        //             return "";
        //     }
        // }


        formatStatusClass: function (statKey) {
            debugger;
            switch (statKey) {
                case "NOSTART":
                    return "None";
                case "APPROVAL":
                    return "Information";
                case "APPROVED":
                    return "Success";
                case "REJECTED":
                    return "Error";
                case "CANCELLED":
                    return "Error";
                case "WAITING":
                    return "Warning";
                case "SENT":
                    return "Information";
                default:
                    return "None";
            }
        },

        formatIconClass: function (statKey) {
            debugger;
            switch (statKey) {
                case "1":
                    return "";
                case "2":
                    return "sap-icon://sys-enter-2";
                case "3":
                    return "sap-icon://error";
                case "4":
                    return "sap-icon://alert";
                case "5":
                    return "sap-icon://information";
                default:
                    return "";
            }
        },

        adjustStartDateForUTC: function (date) {

            //* Start tarihinin UTC'ye göre bir gün geri gitmesini engellemek için
            //* saat kısmını sistem timezone farkına göre ileri alır.
            //* Örn: GMT+3 sistemde 03:00:00 olarak ayarlanır.

            if (!(date instanceof Date)) return date;

            // Lokal zaman farkını al (dakika cinsinden) ve ileri al
            const adjustedDate = new Date(date.getTime());
            const offsetMinutes = adjustedDate.getTimezoneOffset();
            adjustedDate.setMinutes(adjustedDate.getMinutes() - offsetMinutes);

            return adjustedDate;
        },
        dateFormatPopup: function (sDate) {

            if (sDate) {
                const utcDate = new Date(Date.UTC(
                    sDate.getFullYear(),
                    sDate.getMonth(),
                    sDate.getDate()
                ));
                return utcDate.toISOString(); // örn: 2025-05-30T00:00:00.000Z
            } else {
                return null;
            }
        },

        adjustDateToUTC: function (oDate) {
            if (!oDate) return null;

            return new Date(Date.UTC(
                oDate.getFullYear(),
                oDate.getMonth(),
                oDate.getDate()
            )).toISOString();
        },
        dateToYYYYMMDD: function (date) {
            if (!date || !(date instanceof Date)) return null;

            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');

            return `${year}${month}${day}`;  // örn: 20250530
        },


        formatDateFromYYYYMMDD: function (value) {
            if (!value) return null;

            // Sayı geldiyse string'e çevir
            var str = value.toString();

            if (str.length !== 8) return null; // Beklenen uzunlukta değilse geç

            var year = parseInt(str.substring(0, 4), 10);
            var month = parseInt(str.substring(4, 6), 10) - 1; // Ay 0-based
            var day = parseInt(str.substring(6, 8), 10);

            return new Date(year, month, day);
        },


        formatODate: function (date) {
            if (!date) {
                return "";
            }

            var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "dd.MM.yyyy"
            });

            return oDateFormat.format(date);
        },

        formatDecimal: function (value) {

            // debugger;
            if (!value) {
                return "";  // Eğer değer null/undefined ise boş döner.
            }

            // value = parseFloat(value.toString().replace(",", "."));

            // Sayıyı Avrupa formatında formatlayacak olan NumberFormat nesnesini oluşturuyoruz
            var oNumberFormat = NumberFormat.getFloatInstance({
                maxFractionDigits: 2,
                minFractionDigits: 2,
                groupingEnabled: true,
                groupingSeparator: ".",  // Binlik ayırıcı olarak nokta kullanılır
                decimalSeparator: ","    // Ondalık ayırıcı olarak virgül kullanılır
            });

            // Değeri formatlayıp döndürüyoruz
            return oNumberFormat.format(value);
        },

        formatDateTime: function (oDate, oTime) {
            if (!oDate) return "";

            try {
                // Tarihi string olarak alalım (güvenli yöntem)
                var dateObj = new Date(oDate);
                var dateStr = isNaN(dateObj) ? "" :
                    dateObj.getDate().toString().padStart(2, '0') + '.' +
                    (dateObj.getMonth() + 1).toString().padStart(2, '0') + '.' +
                    dateObj.getFullYear();

                // Zaman varsa ms cinsinden alalım
                var timeStr = "";
                if (oTime && oTime.ms > 0) {
                    var totalSec = Math.floor(oTime.ms / 1000);
                    var hh = Math.floor(totalSec / 3600).toString().padStart(2, '0');
                    var mm = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
                    var ss = (totalSec % 60).toString().padStart(2, '0');
                    timeStr = hh + ":" + mm + ":" + ss;
                }

                return dateStr + (timeStr ? " - " + timeStr : " - ");
            } catch (e) {
                return "Geçersiz tarih";
            }
        },
        redLabelFormatter: function (value) {
            return value === "E" ? "redLabel" : "";
        },


        readOnlyEnjGapFormatter: function (bReadOnly, bButtonVisible) {
            return bReadOnly === false ? bButtonVisible : false;
        }




    };
});