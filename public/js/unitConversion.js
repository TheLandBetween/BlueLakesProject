// Defaults: CM / KG

module.exports = {
    // Method to convert and show lbs preference if necessary
    weightConversion: function(currentUserPref, weight) {
        if (currentUserPref !== 'kg') {
            return Math.round(weight * 2.205 * 100) / 100 // round to two decimals
        } else {return weight}
    },
    // Method to convert and show inch preference if necessary
    distConversion: function(currentUserPref, dist) {
        if (currentUserPref !== 'cm') {
            return Math.round(dist / 2.54 * 100) / 100 // round to two decimals
        } else {return dist}
    },
    // Method to convert and save if user isn't using default measurements
    saveWeightConversion: function(currentUserPref, weight) {
        if (currentUserPref !== 'kg') {
            return Math.round(weight / 2.205 * 100) / 100 // round to two decimals
        } else {return weight}
    },
    // Method to convert and save if user isn't using default measurements
    saveDistConversion: function(currentUserPref, dist) {
        if (currentUserPref !== 'cm') {
            return Math.round(dist * 2.54 * 100) / 100 // round to two decimals
        } else {return dist}
    }
}
