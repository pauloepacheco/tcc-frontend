/**
    Created by Paulo Pacheco on 7/29/2015
*/

angular.module('tccAPP')
    .controller('dataBaseTaskCtrl', ['config','$scope', 'databaseTaskFactory', 'commonFactory', '$log',
        function (config, $scope, databaseTaskFactory, commonFactory, $log) {

    $scope.init = function(){
       $scope.schemas = [];
       $scope.tables = [];
       $scope.currentColumnRow = [];
       $scope.alerts = [];
       $scope.columnsCount = 0;
       $scope.numberRecordsToBeProcessed = 0;
       $scope.selectedRow = {};
       $scope.selectedRecordsToProcess = [];
       $scope.reportDownloadRest = undefined;
       $scope.showDownloadLink = false;
       getSchemaAndTables();
       setRequestButtonState(0);
    }

    $scope.getColumnsTemplate = function (row) {
        if (row.column === $scope.selectedRow.column) return 'edit';
        else return 'display';
    };

    $scope.getTablesTemplate = function () {
        return 'displayTables';
    };

    $scope.editRow = function (row) {
       $scope.selectedRow = angular.copy(row);
    };

    $scope.saveRow = function (columnIndex) {
       var regex = $scope.selectedRow.regex;
       if(regex !== null && regex.trim() !== ""){
          validateRegularExpression(columnIndex, regex);
       } else {
          setScreenAttributes($scope.tableIndex, columnIndex);
       }
    };

    $scope.resetSelectedRow = function () {
        $scope.selectedRow = {};
        $scope.alerts = [];
    };

    $('#processRequestButton').click(function() {
       var parameter = angular.toJson($scope.selectedRecordsToProcess);
       executeDataQualityProcess(parameter);
    });

    $('#resetButton').click(function() {
       $scope.init();
    });

    $scope.init();

    function getSchemaAndTables() {
       databaseTaskFactory.getDBInitialLoad()
          .then(function (data) {
             parseSchemas(data);
          }, function  (error) {
             addErrorMessage(error);
          });
    }

    function validateRegularExpression(columnIndex, regex){
       var result = false;
       commonFactory.callRegexValidator(regex)
         .then(function (isRegexValid) {
            if(isRegexValid){
               setScreenAttributes($scope.tableIndex, columnIndex);
            } else {
               addWarningMessage("The entered regular expression is not valid.");
            }
         }, function (error) {
            addErrorMessage(error);
         });
    }

    function executeDataQualityProcess(parameter) {       
       databaseTaskFactory.processDataQualityRequest(parameter)
          .then(function (data) {
              if(data.reportAvailable){
                  $scope.init();
                  $scope.reportDownloadRest = config.url + '/ws/dataquality/download/' + data.reportId;
                  $scope.showDownloadLink = true;
              } else {
                  $scope.init();
                  addSuccessMessage("The request has been completed. There is nothing for download.");
              }
          }, function  (error) {
            addErrorMessage(error);
       });
    }

    function setScreenAttributes(tableIndex, columnIndex){
       $scope.selectedRecordsToProcess[tableIndex].columns[columnIndex] = angular.copy($scope.selectedRow);
       $scope.currentColumnRow.columns[columnIndex] = angular.copy($scope.selectedRow);
       $scope.resetSelectedRow($scope.currentColumnRow);
       updateNumberRecordsToBeProcessed();
       setRequestButtonState($scope.numberRecordsToBeProcessed);
    }

    function updateNumberRecordsToBeProcessed(){
       $scope.numberRecordsToBeProcessed = 0;
       $scope.selectedRecordsToProcess.forEach(function(obj) {
          obj.columns.forEach(function(column) {
             if(column.regex !== null && column.regex.trim() !== ""){
                $scope.numberRecordsToBeProcessed += 1;
             }
          });
       });
    }

    function parseSchemas(schemaJsonResponse){
       if(schemaJsonResponse != undefined && schemaJsonResponse.length > 0){
          schemaJsonResponse.forEach(function(databaseSchema) {
             var schemaName = databaseSchema.schema;
             var tables = databaseSchema.tables;

             $scope.schemas.push(schemaName);
             parseTables(schemaName, tables);
          });
      } else {
         addWarningMessage('There is any record to process');
      }
    }

    function parseTables(databaseSchema, tables){       
       if(tables != undefined && tables.length > 0){
          tables.forEach(function(entry) {
            $scope.tables.push({table: entry.table, schema: databaseSchema});
          });
       }
    }

    $scope.showColumns = function(tableObj, tableIndex){
       $scope.tableIndex = tableIndex;
       if($scope.selectedRecordsToProcess[tableIndex] === undefined){
         $scope.selectedRecordsToProcess[tableIndex] = angular.copy(tableObj);

         databaseTaskFactory.getColumnsFromTable(tableObj)
            .then(function (data) {
               $scope.currentColumnRow = data;
               $scope.selectedRecordsToProcess[tableIndex] = angular.copy(data);
               $scope.columnsCount = $scope.currentColumnRow.columns.length;
            }, function  (error) {
               addErrorMessage(error);
            });

       } else { // avoid call restapi when records are already loaded
          $scope.currentColumnRow = $scope.selectedRecordsToProcess[tableIndex];
          $scope.columnsCount = $scope.currentColumnRow.columns.length;
       }
    }

    function setRequestButtonState(selectedRecords){
        $('#processRequestButton').attr('disabled', selectedRecords > 0 ? false : true);
        $('#processRequestButton').text(selectedRecords > 0 ? 'START DATA QUALITY PROCESS' : 'THERE IS NOTHING TO PROCESS');
    }
    function addErrorMessage(msg){
        $scope.alerts = [{
          type: 'danger',
          msg: msg
        }];
    }

    function addWarningMessage(msg){
        $scope.alerts = [{
          type: 'warning',
          msg: msg
        }];
    }

    function addSuccessMessage(msg){
        $scope.alerts = [{
          type: 'success',
          msg: msg
        }];
    }

    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };
}]);
