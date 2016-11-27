/**
    Created by Paulo Pacheco on 9/15/2015
*/

angular.module('tccAPP')
    .factory('commonFactory', ['config', '$http', '$q', function(config, $http, $q) {

    var commonFactory = {};

    commonFactory.callRegexValidator = function (regex) {
      NProgress.start();
    	var deferred = $q.defer();
    	$http.post(config.url + '/ws/common/validator/regex', regex).
    	 	success(function(response) {
            deferred.resolve(response.valid);
         }).error(function(data, status) {
            deferred.reject('Opsss! Unable to validate regular expression.');
         }).finally(function() {
            NProgress.done();
         });
      return deferred.promise;
    };
    return commonFactory;
}]);
