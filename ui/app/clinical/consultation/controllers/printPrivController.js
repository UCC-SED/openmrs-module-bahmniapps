'use strict';

angular.module('bahmni.clinical')
    .controller('printPrivController', ['$scope','$rootScope', '$q','treatmentService', 'dispositionService', 'printPrivService','retrospectiveEntryService', 'spinner','$state', 
    function ($scope,$rootScope, $q,treatmentService, dispositionService, printPrivService,retrospectiveEntryService, spinner,$state,) {
        var consultation = $scope.consultation;
        console.log($scope.consultation);
        var allDispositions = [];
		$scope.female=null;
		$scope.male=null;
		$scope.tb_other=null;
		$scope.tb_lung=null;
		$scope.HIVstatus=null;
		
		if($scope.patient.gender=='F')
		$scope.female="✔";
		else
		$scope.male="✔";
		treatmentService.getAllDrugOrdersFor($scope.patient.uuid,"All TB Drugs").then(function(response){
			console.log("-- - -- -- ---");
			console.log(response[0]);
			 if(response.length>0)
           {
           var oldestData=response.length-1;
          
           $scope.dotStart=response[oldestData].effectiveStartDate;
            
			}
			
			if(response.length>0)
           {
         
           $scope.dotEnd=response[0].effectiveStartDate;
            
			}
			//get medicine names as one string
			
			
		});
		printPrivService.getTransferData($scope.patient.uuid,"Facility Transfers").then(function(data){
           $scope.transferData = data;
            retriveTransferData($scope.transferData.data[0].groupMembers);
        });
        
        printPrivService.getTB($scope.patient.uuid).then(function(data)
        {
			$scope.tbData=data;
			console.log("TB data");
            console.log($scope.tbData);
            if(data.data.results.length>0){
            tbStartdate(data.data.results[0].dateEnrolled);
            getTbData($scope.tbData.data.results[0].attributes);
			}
		});
		
		printPrivService.getTransferData($scope.patient.uuid,"TB - DOT - startDate").then(function(data){
           $scope.dotStart = data;
          
           if($scope.dotStart.data.length>0)
           {
           var oldestData=$scope.dotStart.data.length-1;
          
           $scope.dotStart=$scope.dotStart.data[oldestData].value;
            
			}
        });
        
        printPrivService.getTransferData($scope.patient.uuid,"TB - DOT - EndDate").then(function(data){
           $scope.dotEnd = data;
           
           if($scope.dotEnd.data.length>0)
           {
          
           console.log($scope.dotEnd.data[0].value);
           $scope.dotEnd=$scope.dotEnd.data[0].value;
            
			}
        });
        
        var getTBmedsNames = function (data){
			var names = null;
			data.forEach(function(obj){
				if(obj.concept.shortName)
				{
					names = names+","+obj.concept.shortName;
				}else{
				names = names+","+obj.concept.name;
			}
			
				
			});


			while(names.charAt(0) == ',')
			{
			names = names.substr(1);
			}			
			$scope.medName=names;
		}
		
		function getTbData(objz)
		{
			objz.forEach(function(obj)
			{
				console.log(obj.attributeType.display);
			if(obj.attributeType.display=="Classification by site")	
			{

				
				if(obj.value.display=="TB - Pulmonary")
				{
				
				$scope.tb_lung="✔";
				}
				if(obj.value.display=="TB - Extra-pulmonary")
				{
				$scope.tb_other="✔";
				
				}
			}
				
				if(obj.attributeType.display=="HIV Status")	
			{
				
				
				if(obj.value.display=="TB - HIV Status - Positive")
				{
				
				$scope.HIVstatus="✔";
				}
				
			}
				
			});
		};
		
		function tbStartdate(data)
		{
			$scope.startDate=data;
			
		};
		
		function retriveTransferData(newObs)
		{
		newObs.forEach(function(obs) 
			{
			if(obs.conceptNameToDisplay=="Name of Facility To be Transfer")
			{	
			
			$scope.hospital_name=obs.valueAsString;
			console.log($scope.clinical_notes);
			
			
			} if(obs.conceptNameToDisplay=="Clinical Notes")
			{
				$scope.clinical_notes=obs.valueAsString;
				
			}
			
			if(obs.conceptNameToDisplay=="Remarks/Reasons")
			{
			$scope.remarks=obs.valueAsString;
			}
				
			});
		};
			
			/*var diagnosis=$scope.consultation.pastDiagnoses;
			diagnosis.forEach(function(dg) 
			{
				if(dg.codedAnswer.name=="Tuberculosis, pulmonary, NOS")
				{
					$scope.tb_lung="✔";
				}
					
			});*/
			
		var getClinicalNotes= function()
		{
			
		};
		
        var getPreviousDispositionNote = function () {
            if (consultation.disposition && (!consultation.disposition.voided)) {
                return _.find(consultation.disposition.additionalObs, function (obs) {
                    return obs.concept.uuid === $scope.dispositionNoteConceptUuid;
                });
            }
        };

        var getDispositionNotes = function () {
            var previousDispositionNotes = getPreviousDispositionNote();
            if (getSelectedConceptName($scope.dispositionCode, $scope.dispositionActions)) {
                return _.cloneDeep(previousDispositionNotes) || {concept: {uuid: $scope.dispositionNoteConceptUuid}};
            }
            else {
                return {concept: {uuid: $scope.dispositionNoteConceptUuid}};
            }
        };

        var getDispositionActionsPromise = function () {
            return dispositionService.getDispositionActions().then(function (response) {
                allDispositions = new Bahmni.Clinical.DispostionActionMapper().map(response.data.results[0].answers);
                $scope.dispositionActions = filterDispositionActions(allDispositions, $scope.$parent.visitSummary);
                $scope.dispositionCode = consultation.disposition && (!consultation.disposition.voided) ? consultation.disposition.code : null;
                $scope.dispositionNote = getDispositionNotes();
            });
        };

        var findAction = function (dispositions, action) {
            var undoDischarge = _.find(dispositions, action);
            return undoDischarge || {'name': ''};
        };

        var filterDispositionActions = function (dispositions, visitSummary) {
            var defaultDispositions = ["Undo Discharge", "Admit Patient", "Transfer Patient", "Discharge Patient"];
            var finalDispositionActions = _.filter(dispositions, function (disposition) {
                return defaultDispositions.indexOf(disposition.name) < 0;
            });
            var isVisitOpen = visitSummary ? _.isEmpty(visitSummary.stopDateTime) : false;

            if (visitSummary && visitSummary.isDischarged() && isVisitOpen) {
                finalDispositionActions.push(findAction(dispositions, {name: "Undo Discharge"}));
            }
            else if (visitSummary && visitSummary.isAdmitted() && isVisitOpen) {
                finalDispositionActions.push(findAction(dispositions, { name: "Transfer Patient"}));
                finalDispositionActions.push(findAction(dispositions, { name: "Discharge Patient"}));
            }
            else {
                finalDispositionActions.push(findAction(dispositions, { name: "Admit Patient"}));
            }
            return finalDispositionActions;
        };

        $scope.isRetrospectiveMode = function () {
            return !_.isEmpty(retrospectiveEntryService.getRetrospectiveEntry());
        };

        $scope.showWarningForEarlierDispositionNote = function () {
            return !$scope.dispositionCode && consultation.disposition;
        };

        var getDispositionNotePromise = function () {
            return dispositionService.getDispositionNoteConcept().then(function (response) {
                $scope.dispositionNoteConceptUuid = response.data.results[0].uuid;
            });
        };

        var loadDispositionActions = function () {
            return getDispositionNotePromise().then(getDispositionActionsPromise);
        };

        $scope.clearDispositionNote = function () {
            $scope.dispositionNote.value = null;
        };

        var getSelectedConceptName = function (dispositionCode, dispositions) {
            var selectedDispositionConceptName = _.findLast(dispositions, {code: dispositionCode}) || {};
            return selectedDispositionConceptName.name;
        };

        var getSelectedDisposition = function () {
            if ($scope.dispositionCode) {
                $scope.dispositionNote.voided = !$scope.dispositionNote.value;
                var disposition = {
                    additionalObs: [],
                    dispositionDateTime: consultation.disposition && consultation.disposition.dispositionDateTime,
                    code: $scope.dispositionCode,
                    conceptName: getSelectedConceptName($scope.dispositionCode, allDispositions)
                };
                if ($scope.dispositionNote.value || $scope.dispositionNote.uuid) {
                    disposition.additionalObs = [_.clone($scope.dispositionNote)];
                }
                return disposition;
            }
        };

        spinner.forPromise(loadDispositionActions(), '#disposition');

        var saveDispositions = function () {
            var selectedDisposition = getSelectedDisposition();
            if (selectedDisposition) {
                consultation.disposition = selectedDisposition;
            } else {
                if (consultation.disposition) {
                    consultation.disposition.voided = true;
                    consultation.disposition.voidReason = "Cancelled during encounter";
                }
            }
        };
        
        $scope.gotTotransfer = function () {
               $state.go('patient.dashboard.show.referral', {}, { reload: true });
            };

        $scope.consultation.preSaveHandler.register("dispositionSaveHandlerKey", saveDispositions);
        $scope.$on('$destroy', saveDispositions);
    }]);
