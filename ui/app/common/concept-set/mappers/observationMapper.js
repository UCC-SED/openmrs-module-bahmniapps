Bahmni.ConceptSet.ObservationMapper = function () {
    var conceptMapper = new Bahmni.ConceptSet.ConceptMapper();

    // tODO : remove conceptUIConfig
    var newObservation = function (concept, savedObs) {
        var observation = { concept: conceptMapper.map(concept), units: concept.units, label: concept.display, possibleAnswers: concept.answers, groupMembers: []};
        return new Bahmni.ConceptSet.Observation(observation, savedObs);
    };

    var findInSavedObservation = function (concept, observations) {
        return _.filter(observations, function (obs) {
            return obs && concept.uuid === obs.concept.uuid;
        });
    };

    var mapObservationGroupMembers = function (observations, conceptSetMembers, conceptSetConfig) {
        var observationGroupMembers = [];
        conceptSetMembers.forEach(function (memberConcept) {
            var savedObservations = findInSavedObservation(memberConcept, observations);
            var configForConcept = conceptSetConfig[memberConcept.name.name] || {};
            var numberOfNodes = configForConcept.multiple || 1; 
            for(var i =0; i < savedObservations.length; i++) {
                observationGroupMembers.push(mapObservation(memberConcept, savedObservations[i], conceptSetConfig))
            }
            for(var i =0; i < numberOfNodes - savedObservations.length; i++) {
                observationGroupMembers.push(mapObservation(memberConcept, null, conceptSetConfig))
            }
        });
        return observationGroupMembers;
    };

    var newObservationNode = function (concept, savedObsNode, conceptSetConfig) {
        var observation = { concept: conceptMapper.map(concept), units: concept.units, label: concept.display, possibleAnswers: concept.answers, groupMembers: []};
        return new Bahmni.ConceptSet.ObservationNode(observation, savedObsNode, conceptSetConfig);
    };

    var mapObservation = function (concept, savedObs, conceptSetConfig) {
        if (savedObs && (savedObs.isObservation || savedObs.isObservationNode)) 
            return savedObs;

        var observation;
        if (concept.conceptClass.name === Bahmni.Common.Constants.conceptDetailsClassName) {
            observation = newObservationNode(concept, savedObs, conceptSetConfig);
        } else {
            observation = newObservation(concept, savedObs);
        }

        var savedObsGroupMembers = savedObs ? savedObs.groupMembers : [];
        observation.groupMembers = concept.set ? mapObservationGroupMembers(savedObsGroupMembers, concept.setMembers, conceptSetConfig) : [];

        return observation;
    };

    this.map = function (observations, rootConcept, conceptSetConfig) {
        var savedObs = findInSavedObservation(rootConcept, observations)[0];
        return mapObservation(rootConcept, savedObs, conceptSetConfig || {});
    };
};
