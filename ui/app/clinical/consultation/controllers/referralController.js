'use strict';

angular.module('bahmni.clinical')
    .controller('ReferralController',['$scope', '$rootScope', '$window','$http','contextChangeHandler', 'spinner', 'conceptSetService',
        'messagingService', 'referralConceptSet', 'appService','$state','locationService','$location', 'visitConfig','sessionService','configurations', 'retrospectiveEntryService',
        function ($scope, $rootScope,$window, $http,contextChangeHandler, spinner, conceptSetService, messagingService, referralConceptSet,
                  appService,$state,locationService,$location,visitConfig,sessionService,configurations, retrospectiveEntryService) {
					 
           
        // $scope.configName = $stateParams.configName;
          $scope.consultation.extensions = $scope.consultation.extensions ? $scope.consultation.extensions : {mdrtbSpecimen: []};
            var initializeReferralScopes = function () {
               $scope.newSpecimens = $scope.consultation.newlyAddedSpecimens || [];
            };
            console.log($scope.observation);
			//initializeReferralScopes();
         
            $scope.isRetrospectiveMode = function () {
                return !_.isEmpty(retrospectiveEntryService.getRetrospectiveEntry());
            };
			
			
            var init = function () {
                var results = _.find(referralConceptSet.setMembers, function (member) {
                    return member.conceptClass.name === "Transfer_Referrals";
                });
               
                $scope.resultsConceptName = results && results.name.name;
                $scope.referObservation=$scope.consultation.observations;

            };

            $scope.gotToPrint = function () {
               $state.go('patient.dashboard.show.printPriv');
            };

            var postSaveReferral = function()
            {
				console.log("Post Save");
				
				console.log($scope.consultation.observations[0].groupMembers);
				findTransferType($scope.consultation.observations[0].groupMembers);
				if($scope.TransferIn===true)
				{
					console.log("call change visit function");
					
					locationService.getAllByTag('Login Location').then(function(data)
					{
					getLocationuuid(data.data.results);
					changeVisit($scope.consultation.observations[0].groupMembers);
					});
					
					
				}
			
				
				
            }
            
            var getLocationuuid = function (locations)
            {
				locations.forEach(function(location)
				{
					if(location.display==$scope.choseenVisit)
					{
						console.log("Location Uuid");
						$scope.locationUuid=location.uuid;
					}
					
				});
				
			}
            
            
           var findTransferType = function (dataTrans)
            {
				$scope.TransferIn=false;
				dataTrans.forEach(function(data)
				{
					if(data.conceptNameToDisplay=="Transfer/Referral")
					{	
						
						
						if(data.valueAsString=="In")
						{
						$scope.TransferIn= true;
						
						}
					}
					if(data.conceptNameToDisplay=="Referral Programs")
					{	
						
						$scope.choseenVisit = data.valueAsString;
						
					}
					
					
				});
				
				
				
			};
			
			var changeVisit = function(dataTrans)
			{
				console.log("hang");
				var encounterConfig = angular.extend(new EncounterConfig(), configurations.encounterConfig());
				var visitTypes = encounterConfig.getVisitTypes();
				
				 
			
				
			//get Uuuid of the selectedVisit	
				visitTypes.forEach(function(visitType)
				{
						
					if(visitType.name==$scope.choseenVisit)
					{	
						$scope.visitUuid = visitType.uuid;
					}
					
				});
				console.log("send data");
				console.log($scope.locationUuid);
				openVisit($scope.patient.uuid,$scope.visitUuid,$scope.locationUuid);
				
			}
			
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

           // $scope.consultation.preSaveHandler.register("referralSaveHandlerKey", saveReferall);
             $scope.consultation.postSaveHandler.register("referralPostSaveHandlerKey", postSaveReferral);

            init();

        }
    ])
;
