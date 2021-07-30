module.exports = {
    weightConversion: function(currentUserPref, weight) {
        if (currentUserPref !== 'kg') {
            return Math.round(weight / 2.205 * 100) / 100 // round to two decimals
        } else {return weight}
    },
    distConversion: function(currentUserPref, dist) {
        if (currentUserPref !== 'cm') {
            return Math.round(dist * 2.54 * 100) / 100 // round to two decimals
        } else {return dist}
    }
    // saveWeightConversion: function(weight) {
    //     if (currentUser.weightPref !== 'kg') {
    //         return weight
    //     }
    // },
    // saveDistConversion: function(dist) {
    //
    // }
}
