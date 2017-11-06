'use strict';

angular.module('bahmni.clinical')
    .controller('ReferralController', ['$scope', '$rootScope','$stateParams', 'conceptSetService',
        'messagingService', 'referralConceptSet', 'appService','retrospectiveEntryService',
        function ($scope, $rootScope, conceptSetService, $stateParams,messagingService, referralConceptSet,
                  appService, retrospectiveEntryService) {
					  
         $scope.configName = $stateParams.configName;
         
            $scope.isRetrospectiveMode = function () {
                return !_.isEmpty(retrospectiveEntryService.getRetrospectiveEntry());
            };

            var init = function () {
                
                var results = _.find(referralConceptSet.setMembers, function (member) {
                    return member.conceptClass.name === "Transfer_Referrals";
                });
                console.log($scope.consultation.observation);
                console.log(results);
                $scope.resultsConceptName = results && results.name.name;

 
            };

            var saveReferall = function(){
				$scope.consultation.observations.push($scope.resultsConceptName);
                console.log("check check");
            }

            $scope.consultation.preSaveHandler.register("referralSaveHandlerKey", saveReferall);


            init();

        }
    ])
;
