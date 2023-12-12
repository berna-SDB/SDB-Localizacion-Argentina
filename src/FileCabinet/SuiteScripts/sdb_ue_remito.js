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
        var thisRecord = context.newRecord;
        var id = thisRecord.getValue("id")
        var idRecord = 0;
        var itemfulfilment = record.load({
            type: record.Type.ITEM_FULFILLMENT,
            id: id,
            isDynamic: true
        });

        log.debug("itemfulfilment", itemfulfilment);
        var lineCount = itemfulfilment.getLineCount({ sublistId: 'item' });
        log.debug("lineCount", lineCount)
        var locationItem = "";
        for (var i = 0; i < lineCount; i++) {
            itemfulfilment.selectLine({
                sublistId: 'item',
                line: i
            });
            var itemLocation = itemfulfilment.getCurrentSublistText({
                sublistId: 'item',
                fieldId: 'location',
            });
            locationItem = itemLocation;
        }
        log.debug("locationItem", locationItem)
        if (locationItem.includes("Santa Fe")) idRecord = 101;
        if (locationItem.includes("Mendoza")) idRecord = 1;
        if (locationItem.includes("Buenos Aires")) idRecord = 102;
        var remito = thisRecord.getValue("custbody_sdb_numero_remito");
        var remitoViejo=thisRecord.getValue("custbody_sdb_numeros_anulados");   
        var remitoReimprimir = thisRecord.getValue("custbody_sdb_anulado")
        log.debug("remito", remito)
        if (remito&&!remitoReimprimir) {
        }else {
            if(remitoReimprimir){
            var numero = getNumber(idRecord)
            remito=remito+",";
            remitoViejo=remitoViejo+remito;
            itemfulfilment.setValue("custbody_sdb_numero_remito", numero);
            itemfulfilment.setValue("custbody_sdb_numeros_anulados", remitoViejo);
            itemfulfilment.setValue("custbody_sdb_anulado",false);
            itemfulfilment.save();
        
        }else{
            var numero = getNumber(idRecord)
            itemfulfilment.setValue("custbody_sdb_numero_remito", numero);
            itemfulfilment.save();
        }
    }
    }
    function getNumber(idRecord) {
        let remitoRecord = record.load({
            type: "customrecord_sdb_remito",
            id: idRecord,
        });

        log.debug("newValue", JSON.stringify(remitoRecord))
        var valor_remito = remitoRecord.getValue("custrecord_sdb_ultimo_numero")
        var newValue = valor_remito + 1
        log.debug("newValue", newValue)
        remitoRecord.getValue("custrecord_sdb_ultimo_numero")
        var sucursal = remitoRecord.getValue("custrecord_sdb_sucursal")
        remitoRecord.setValue("custrecord_sdb_ultimo_numero", newValue);
        remitoRecord.save();
        return sucursal += newValue
    }

    return {
        afterSubmit: afterSubmit
    }
});
