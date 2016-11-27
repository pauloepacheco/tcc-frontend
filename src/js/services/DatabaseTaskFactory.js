/**
    Created by Paulo Pacheco on 7/29/2015
*/

angular.module('tccAPP')
    .factory('databaseTaskFactory', ['config', '$http', '$q', '$log', 
        function(config, $http, $q, $log) {

    var databaseTaskFactory = {};

    databaseTaskFactory.getDBInitialLoad = function () {
    	var deferred = $q.defer();
        NProgress.start();
    	$http.post(config.url + '/ws/db/getInitialLoad').
    	 	success(function(response) {
                deferred.resolve(response);
            }).error(function(error) {
                deferred.reject(convertErrorMessageResponse(error));
            }).finally(function() {
                NProgress.done();
            });
      return deferred.promise;
    };

    databaseTaskFactory.getColumnsFromTable = function (parameters) {
    	var deferred = $q.defer();
        NProgress.start();
    	$http.post(config.url + '/ws/db/getColumns', parameters).
    	 	success(function(response) {
                deferred.resolve(response);
            }).error(function(error) {
                deferred.reject(convertErrorMessageResponse(error));
            }).finally(function(){
                NProgress.done();
            });
      return deferred.promise;
    };

    databaseTaskFactory.processDataQualityRequest = function(parameters) {
        var deferred = $q.defer();
        NProgress.start();
    	$http.post(config.url + '/ws/dataquality/process', parameters).        
            success(function(response) {
                deferred.resolve(response);
            }).error(function(error) {        
                deferred.reject(convertErrorMessageResponse(error));
            }).finally(function(){
                NProgress.done();
            });
      return deferred.promise;
   }

   function convertErrorMessageResponse(error){
        var errorMsg = undefined;
        if(error.message === undefined || error.message === ""){
            errorMsg = 'Opsss! Unable to process request due to an internal error';
        } else {
            errorMsg = error.message;
        }
        return errorMsg;
   }

    return databaseTaskFactory;
}]);
