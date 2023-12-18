/**
 * @NApiVersion 2.1
 * @Version 1.0
 * @NScriptType UserEventScript
*/

define([
    "N/log",
    "N/record",
    "N/runtime",
    "N/error",
    "N/search",
], function (log, record, runtime, error, search) {
    function afterSubmit(context) {
        try {
            var thisRecord = context.newRecord;

            var idRecord = 0;
            var itemfulfilment = record.load({
                type: record.Type.ITEM_FULFILLMENT,
                id: thisRecord.id,
                isDynamic: true
            });

            log.debug("itemfulfilment", itemfulfilment);
            log.debug("lineCount", lineCount);
            var locationItem = "";
            var locationObjs = {};
            var prefLocation = preferedLocation();
            var lineCount = itemfulfilment.getLineCount({ sublistId: 'item' });
            for (var i = 0; i < lineCount; i++  ) {
                itemfulfilment.selectLine({
                    sublistId: 'item',
                    line: i
                });
                var itemLocation = itemfulfilment.getCurrentSublistText({
                    sublistId: 'item',
                    fieldId: 'location',
                });
                var itemLocationVal = itemfulfilment.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'location',
                });
                log.debug('itemLocationVal',itemLocationVal);
                if(!locationObjs[itemLocationVal]){
                    locationObjs[itemLocationVal] = {};
                }
                locationObjs[itemLocationVal] = itemLocationVal;
            }
            log.debug("locationItem", locationItem);

            var idsLocations = Object.keys(locationObjs);
            var idRecord = searchRcdByLocation(idsLocations[0]);
            

            var remito = thisRecord.getValue("custbody_sdb_numero_remito");
            var remitoViejo = thisRecord.getValue("custbody_sdb_numeros_anulados");
            var remitoReimprimir = thisRecord.getValue("custbody_sdb_anulado");

            log.debug("remito", remito)
            if (remito && !remitoReimprimir) {
            } else {
                if (remitoReimprimir) {
                    var numero = getNumber(idRecord)
                    remito = remito + ",";
                    remitoViejo = remitoViejo + remito;
                    itemfulfilment.setValue("custbody_sdb_numero_remito", numero);
                    itemfulfilment.setValue("custbody_sdb_numeros_anulados", remitoViejo);
                    itemfulfilment.setValue("custbody_sdb_anulado", false);
                    itemfulfilment.save();

                } else {
                    var numero = getNumber(idRecord)
                    itemfulfilment.setValue("custbody_sdb_numero_remito", numero);
                    itemfulfilment.save();
                }
            }
        } catch (error) {
            log.debug('errores en el after submit',error)
        }

    }
    function getNumber(idRecord) {
        let remitoRecord = record.load({
            type: "customrecord_sdb_remito",
            id: idRecord,
        });
        log.debug("newValue", JSON.stringify(remitoRecord));
        var valor_remito = remitoRecord.getValue("custrecord_sdb_ultimo_numero")
        var newValue = valor_remito + 1
        log.debug("newValue", newValue);
        remitoRecord.getValue("custrecord_sdb_ultimo_numero");
        var sucursal = remitoRecord.getValue("custrecord_sdb_sucursal");
        remitoRecord.setValue("custrecord_sdb_ultimo_numero", newValue);
        remitoRecord.save();
        return sucursal += newValue
    }
    function preferedLocation() {
        var preferedLocation = record.load({
            type: 'customrecord_sdb_locations_remito',
            id: 1
        });
        var multiSelect = preferedLocation.getValue('custrecord_sdb_select_locations');
        log.debug('multiSelect', multiSelect);
    }
    function searchRcdByLocation(locationId){
        var customRcdRemito = search.create({
            type:'customrecord_sdb_remito',
            filters: ["custrecord_sdb_param_locations","any",locationId],
        });
        var count = customRcdRemito.runPaged().count;
        log.debug('count',count);
        var resultId = [];
        customRcdRemito.run().each(function(result){
            log.debug('result',result);
            resultId.push(result.id)
            return true;
        });
        return resultId;
    }


    return {
        afterSubmit: afterSubmit
    }
});
