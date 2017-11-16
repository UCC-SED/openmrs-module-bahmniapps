'use strict';

angular.module('bahmni.clinical')
    .service('printPrivService', ['$http', function ($http) {
        var getTransferData = function (patientUuid, conceptName) {
            var params = {
                patientUuid: patientUuid,
                concept: conceptName
            };
            return $http.get(Bahmni.Common.Constants.observationsUrl, {params: params});
        };
        
        
        var getTB = function (patientUuid) {
            var params = {
                patient: patientUuid,
                v: "full"
            };
            return $http.get(Bahmni.Common.Constants.programEnrollPatientUrl, {params: params});
        };
        
        var openVisit = function (patientUuid,visitType,location)
         {
            var params = {
                patient: patientUuid,
                location: location,
                visitType: visitType
            };
            
            
            return $http.post(Bahmni.Common.Constants.visitUrl, params, {
                withCredentials: true,
                 headers: {"Accept": "application/json", "Content-Type": "application/json"}
				});
           

        };


        return {
            getTransferData: getTransferData,
            getTB: getTB,
           // openVisit:openVisit
        };
    }]);
