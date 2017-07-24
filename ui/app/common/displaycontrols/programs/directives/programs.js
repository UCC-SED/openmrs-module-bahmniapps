'use strict';

angular.module('bahmni.common.displaycontrol.programs')
    .directive('programs', ['programService', '$state', 'spinner', 'appService',
        function (programService, $state, spinner, appService) {
            var controller = function ($scope) {
                var programSpecificAttributeTypesDefinition = appService.getAppDescriptor().getConfigValue("program").programSpecificAttributeTypesDefinition;
                $scope.initialization = programService.getPatientPrograms($scope.patient.uuid, true, $state.params.enrollment).then(function (patientPrograms) {
                    if (_.isEmpty(patientPrograms.activePrograms) && _.isEmpty(patientPrograms.endedPrograms)) {
                        $scope.$emit("no-data-present-event");
                    }
                    $scope.activePrograms = patientPrograms.activePrograms;
                    $scope.pastPrograms = patientPrograms.endedPrograms;
                });
                $scope.hasPatientAnyActivePrograms = function () {
                    return !_.isEmpty($scope.activePrograms);
                };
                $scope.hasPatientAnyPastPrograms = function () {
                    return !_.isEmpty($scope.pastPrograms);
                };
                $scope.hasPatientAnyPrograms = function () {
                    return $scope.hasPatientAnyPastPrograms() || $scope.hasPatientAnyActivePrograms();
                };
                $scope.showProgramStateInTimeline = function () {
                    return programService.getProgramStateConfig();
                };
                $scope.hasStates = function (program) {
                    return !_.isEmpty(program.states);
                };
                var getProgramAttributeTypeAssignedToProgram = function (currentProgram, programAttributes, programAttributeTypeMapConfig) {
                    var findCurrentProgramConfig = function (programConfig) {
                        return currentProgram.display === programConfig.programName;
                    };
                    var filterProgramAttributes = function (programAttribute) {
                        if (!currentProgramMapConfig) {
                            return true;
                        }
                        return _.indexOf(currentProgramMapConfig.attributeTypes, programAttribute.attributeType.name) >= 0;
                    };
                    if (!programAttributeTypeMapConfig) {
                        return programAttributes;
                    }
                    var currentProgramMapConfig = _.find(programAttributeTypeMapConfig, findCurrentProgramConfig);
                    return _.filter(programAttributes, filterProgramAttributes);
                };
                $scope.getDefinedProgramAttributes = function (program) {
                    return getProgramAttributeTypeAssignedToProgram(program, program.attributes, programSpecificAttributeTypesDefinition);
                };
                $scope.getAttributeValue = function (attribute) {
                    if (isDateFormat(attribute.attributeType.format)) {
                        return Bahmni.Common.Util.DateUtil.formatDateWithoutTime(attribute.value);
                    } else if (isCodedConceptFormat(attribute.attributeType.format)) {
                        var mrsAnswer = attribute.value;
                        var displayName = mrsAnswer.display;
                        if (mrsAnswer.names && mrsAnswer.names.length == 2) {
                            if (mrsAnswer.name.conceptNameType == 'FULLY_SPECIFIED') {
                                if (mrsAnswer.names[0].display == displayName) {
                                    displayName = mrsAnswer.names[1].display;
                                } else {
                                    displayName = mrsAnswer.names[0].display;
                                }
                            }
                        }
                        return displayName;
                    } else {
                        return attribute.value;
                    }
                };
                var isDateFormat = function (format) {
                    return format == "org.openmrs.customdatatype.datatype.DateDatatype";
                };
                var isCodedConceptFormat = function (format) {
                    return format == "org.bahmni.module.bahmnicore.customdatatype.datatype.CodedConceptDatatype";
                };
            };

            var link = function ($scope, element) {
                spinner.forPromise($scope.initialization, element);
            };

            return {
                restrict: 'E',
                link: link,
                controller: controller,
                templateUrl: "../common/displaycontrols/programs/views/programs.html",
                scope: {
                    patient: "="
                }
            };
        }]);
