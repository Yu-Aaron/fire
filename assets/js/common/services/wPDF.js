/*global jsPDF:false */
/***********************************
 *    Weak PDF Generator
 ***********************************/

/* global jsPDF */

(function () {
    'use strict';

    angular
        .module('southWest.services')
        .factory('wPDF', wPDF);

    function wPDF($q, $rootScope, $http, $timeout) {
        //==============Default Setting:================
        var setting = {
            fileName: "Report",
            title: "",
            fieldName: [],
            fieldIndex: [],
            chartW: 950,
            chartH: 450,
            imgxOffset: 15,
            imgyOffset: 25,
            firstPageNum: 10,
            NumPerPage: 25,
            xOffset: 15,
            yOffset: 25,
            lineH: 15,
            fontSize: 15,
            showPageNum: true,
            totalPageNum: 0,
            options: {
                orientation: 'l',
                unit: 'pt',
                format: 'a4'
            },
            styles: '',
            theme: '',
            oddLine: true
        };
        var htmlConvertData = "";

        //==============Theme:================
        var theme = {
            defaults: ['table{border-collapse: collapse;  border: 2px solid black;} table, td, th{border: 1px solid black;} th{color:white; background:gray;}', 'background:#EEEEEE', 'background:#CCCCCC'],
            blueL: ['table, td, th{border: none; text-align: center} th{color:white; background:#4F81BD} td{color:black;}', 'background:#B8CCE4', 'background:#DBE5F1'],
            blueD: ['table, td, th{border: none; text-align: center} th{color:white; background:black} td{color:white;}', 'background:#345B91', 'background:#507FC3'],
            greenL: ['table, td, th{border: none; text-align: center} th{color:white; background:#728F1D} td{color:black;}', 'background:#C4D896', 'background:#DAF0D3'],
            greenD: ['table, td, th{border: none; text-align: center} th{color:white; background:black} td{color:white;}', 'background:#728F1D', 'background:#9FBF45'],
            redL: ['table, td, th{border: none; text-align: center} th{color:white; background:#90352F} td{color:black;}', 'background:#F2D8D7', 'background:#FFEFEF'],
            redD: ['table, td, th{border: none; text-align: center} th{color:white; background:black} td{color:white;}', 'background:#90352F', 'background:#BD4F48']
        };

        //==============Service:================
        var service = {
            getPdf: getPdf
        };
        return service;

        //==============Main Function:================
        function getPdf(options, fileType) {
            var result = {status: 'pdf转化未开始', success: false};
            if (!options) {
                result.status = "表格初始化失败，请检查";
                return result;
            }
            if (!options.fieldName || !options.fieldName.length || !options.fieldIndex || !options.fieldIndex.length) {
                result.status = "当前表格数据发生错误，请检查";
                return result;
            }
            if (options.fieldName.length !== options.fieldIndex.length) {
                result.status = "表头与表格内容列数不一致，请检查";
                return result;
            }
            //Convert API Data to Table Data
            var data = convertData(options.data, options.fieldName, options.fieldIndex);
            //Apply Options:
            for (var key in options) {
                if (options.hasOwnProperty(key) && setting.hasOwnProperty(key) && (options[key] || options[key] === 0)) {
                    setting[key] = options[key];
                }
            }
            // set width based on orientation
            setting.fullWidth = 1070;
            //if(setting.options.orientation !== "1"){
            //  TODO: set fullwidth to something else
            //}

            if (!theme.hasOwnProperty(setting.theme) || setting.theme === '') {
                setting.theme = 'defaults';
            }

            var doc = new jsPDF(setting.options, '', '', '');
            doc.setFontSize(setting.fontSize);

            options.pageNumIndex = [];
            var listPageNum = Math.ceil((data.length - setting.firstPageNum) / setting.NumPerPage);

            if (fileType !== "html") {
                getPdfPageNum(options, doc);
            } else {
                for (var index = 1; index < listPageNum; index++) {
                    options.pageNumIndex.push(setting.NumPerPage * index);
                }
                options.pageNumIndex.push(data.length);
            }
            setting.pageNumIndex = options.pageNumIndex;
            setting.totalPageNum = ((listPageNum < options.pageNumIndex.length) ? options.pageNumIndex.length : listPageNum) + (options.img && options.img.length ? options.img.length : 0);

            //CS-9952 total page num should be image length when data length equals to 0
            if (options.data.length === 0 && options.img) {
                setting.totalPageNum = options.img.length;
            }

            setting.firstPageNum = (setting.firstPageNum > options.pageNumIndex[0]) ? options.pageNumIndex[0] : setting.firstPageNum;

            var convertedImg = [];
            var pageIndex = 1;

            function saveImg(base64Img) {
                convertedImg.push(base64Img);
            }

            if (options.img) {
                for (var i = 0; i < options.img.length; i++) {
                    convertImgToBase64(options.img[i], saveImg);
                }
            }
            convertAllTable(data, (options.img) ? (setting.yOffset + setting.chartH * options.img.length + setting.lineH * options.img.length) : setting.yOffset, setting, doc, setting.title, pageIndex, convertedImg).then(function () {
                if (fileType === "html") {
                    if (options.img) {
                        for (var i = 0; i < options.img.length; i++) {
                            htmlConvertData = htmlConvertData.replace('<table class="wPDF-table"', '<img src="' + convertedImg[i] + '"><br /><br /><table class="wPDF-table"');
                        }
                    }
                    saveToHtml(htmlConvertData);
                    htmlConvertData = "";
                } else {
                    doc.save(setting.fileName + ".pdf");
                    htmlConvertData = "";
                }
            });
        }

        function addImg(convertedImg, pageIndex, doc, setting) {
            for (var i = 0; i < convertedImg.length; i++) {
                doc.addImage(convertedImg[i], 'JPEG', setting.imgxOffset, setting.imgyOffset, setting.chartW, setting.chartH);
                if (setting.showPageNum) {
                    addPageNum(pageIndex, setting.totalPageNum, doc);
                }
                if (pageIndex < convertedImg.length) {
                    doc.addPage(pageIndex++);
                }
            }
        }

        function convertData(inData, fieldName, fieldIndex) {
            var data = [];
            for (var j = 0; j < inData.length; j++) {
                var item = {};
                for (var i = 0; i < fieldName.length; i++) {
                    var item_protocolSourceName = inData[j].protocolSourceName;
                    if ((item_protocolSourceName === "GOOSE" || item_protocolSourceName === "SV" || item_protocolSourceName === "PNRTDCP") && (fieldIndex[i] === "sourceIp" || fieldIndex[i] === "destinationIp")) {
                        item[fieldName[i]] = "";
                    } else {
                        item[fieldName[i]] = inData[j][fieldIndex[i]];
                    }
                }
                data.push(item);
            }
            return data;
        }

        function convertTableLine(data, isHead, isLast) {
            if (data) {
                var htmlData = isHead ? "<table class='wPDF-table' style='background: white; width: " + setting.fullWidth + "px; font-size:0.9em;'><thead>" : "";
                htmlData += "<tr style='";
                htmlData += setting.oddLine ? theme[setting.theme][1] : theme[setting.theme][2];
                htmlData += "'>";
                setting.oddLine = !setting.oddLine;
                //console.log(htmlData);
                var index = 0;
                for (var name in data) {
                    if (isHead) {
                        index++;
                        htmlData += "<th class='col-" + index + "'style='min-width: 110px;'>" + name + "</th>";
                        setting.oddLine = true;
                    } else {
                        index++;
                        htmlData += "<td style='max-width: 600px;'>" + data[name] + "</td>";
                    }
                }
                htmlData += isLast ? "</tr></tbody></table><br /><br />" : isHead ? "</tr></thead><tbody>" : "</tr>";
                return htmlData;
            } else {
                return "当前表格数据发生错误，请检查数据";
            }
        }

        function converSingleTable(data) {
            if (data && data.length) {
                var htmlData = "";
                var header = data && data.length && data[0];
                htmlData += convertTableLine(header, true, false);
                for (var i = 0; i < data.length - 1; i++) {
                    htmlData += convertTableLine(data[i], false, false);
                }
                return htmlData + convertTableLine(data[data.length - 1], false, true);
            } else {
                //return "当前表格数据发生错误，请检查数据";
                return 'blank';
            }
        }

        function renderSinglePage(data, y, doc, title) {
            var deferred = $q.defer();
            if (data && data.length && doc) {
                var iframe = document.createElement('iframe');
                var height = 'auto';
                if (data === 'blank') {
                    y = 0;
                    height = '0';
                    data = "<table class='wPDF-table'></table>";
                }
                if (title) {
                    title = '<div style="width:' + setting.fullWidth + 'px;"><h2 style="text-align:center; width:100%;">' + title + '</h2></div>';
                }
                else {
                    title = '';
                }
                iframe.setAttribute('style', 'background: white; width: auto; height: ' + height + ';');
                iframe.setAttribute('id', 'pdfIframe');
                document.body.appendChild(iframe);
                $timeout(function () {
                    var iframedoc = iframe.contentDocument || iframe.contentWindow.document;
                    iframedoc.body.innerHTML = "<html lang='zh-CN'><head><meta charset='UTF-8'><style>" + theme[setting.theme][0] + setting.styles + "</style></head><body>" + title + data + "</body></html>";
                    htmlConvertData += htmlConvertData ? data : iframedoc.body.innerHTML;
                    html2canvas(iframedoc.body, {
                        background: "#fff",
                        onrendered: function (canvas) {
                            var img = canvas.toDataURL("image/jpeg");
                            doc.addImage(img, "JPEG", setting.xOffset, y);
                            document.body.removeChild(iframe);
                            deferred.resolve();
                        }
                    });
                }, 10);
                return deferred.promise;
            } else {
                deferred.resolve();
                return deferred.promise;
            }
        }

        function convertAllTable(d, firstPageY, setting, doc, title, page, convertedImg) {
            var firstData = converSingleTable(d.slice(0, setting.firstPageNum));
            //console.log(firstData);
            var pageIndex = page;
            return renderSinglePage(firstData, firstPageY, doc, title).then(function () {
                if (setting.showPageNum) {
                    addPageNum(pageIndex, setting.totalPageNum, doc);
                }
                if (convertedImg.length) {
                    addImg(convertedImg, pageIndex, doc, setting);
                }
                if (d.length > setting.firstPageNum) {
                    var data = [], promise = $q.when({});
                    if (setting.firstPageNum === 0) {
                        data.push(d.slice(0, setting.pageNumIndex[0]));
                    }
                    for (var i = 0; i + 1 < setting.pageNumIndex.length; i++) {
                        data.push(d.slice(setting.pageNumIndex[i], setting.pageNumIndex[i + 1]));
                    }

                    data.forEach(function (de) {
                        promise = promise.then(function () {
                            doc.addPage(pageIndex++);
                            return renderSinglePage(converSingleTable(de), setting.yOffset, doc).then(function () {
                                if (setting.showPageNum) {
                                    addPageNum(pageIndex + (convertedImg.length ? (convertedImg.length - 1) : 0), setting.totalPageNum, doc);
                                }
                            });
                        });
                    });
                    return promise.then(function () {
                        return;
                    });
                } else {
                    return;
                }
            });
        }

        function convertImgToBase64(url, callback, outputFormat) {
            var img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = function () {
                var canvas = document.createElement('CANVAS');
                var ctx = canvas.getContext('2d');
                canvas.height = this.height;
                canvas.width = this.width;
                ctx.drawImage(this, 0, 0);
                var dataURL = canvas.toDataURL(outputFormat || 'image/jpeg');
                callback(dataURL);
                canvas = null;
            };
            img.src = url;
        }

        function centeredText(text, y, doc) {
            var textWidth = doc.getStringUnitWidth(text) * 6;
            var textOffset = (doc.internal.pageSize.width - textWidth) / 2;
            doc.text(textOffset, y, text);
        }

        function addPageNum(cur, total, doc) {
            doc.setFontSize(12);
            centeredText(cur + "/" + total, 580, doc);
            //var x = 815 - (cur.toString().length + total.toString().length)*6;
            //doc.text(x, 580, cur + "/" + total);
            doc.setFontSize(setting.fontSize);
        }

        function saveToHtml(sText) {
            try {
                exportHtml(setting.fileName + '.html', sText);
            } catch (err) {
                alert("Error parsing html:\n" + err.message);
            }
        }

        function exportHtml(name, data) {
            var urlObject = window.URL || window.webkitURL || window;

            var export_blob = new Blob([data]);

            var save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
            save_link.href = urlObject.createObjectURL(export_blob);
            save_link.download = name;
            var ev = document.createEvent("MouseEvents");
            ev.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            save_link.dispatchEvent(ev);
        }

        function getPdfPageNum(options, doc) {
            var $dataTable = $('.fixed-table-body table');
            var pageLineHeight = parseInt($dataTable.css('lineHeight'));
            var pageTdPadding = parseInt($dataTable.find('td').css('padding-top'));
            //since there is a font-size defined in table 0.9em, we use 0.9*16*1.3 as pdfLineHeight
            var pdfLineHeight = 19, pdfTdPadding = 1, calHeight = 0;
            var pdfPageHeight = doc.internal.pageSize.height;

            $dataTable.find('tbody tr').each(function (index, tr) {
                var trHeight = parseInt(((parseInt($(tr).css('height')) - pageTdPadding * 2) / pageLineHeight)) * pdfLineHeight + pdfTdPadding * 2;
                calHeight = calHeight + trHeight;
                if (calHeight > pdfPageHeight) {
                    options.pageNumIndex.push(index);
                    calHeight = trHeight;
                } else if (calHeight > pdfPageHeight - 30 && options.pageNumIndex.length === 0 && !options.img) {
                    options.pageNumIndex.push(index);
                    calHeight = trHeight;
                }
            });
            if (options.pageNumIndex.length > 0) {
                if (options.pageNumIndex[options.pageNumIndex.length - 1] < options.data.length) {
                    options.pageNumIndex.push(options.data.length);
                }
            } else {
                options.pageNumIndex.push(options.data.length);
            }
        }

    }

})();
