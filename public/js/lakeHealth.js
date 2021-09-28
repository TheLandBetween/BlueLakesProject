$("#addtemp_DO").click(function() { //Add a card to the TempDO container
    tempDOCount = tempDOCount + 1;
    console.log(tempDOCount);
    $("#tempDO_Container").append(`
        <div class="card">
            <div class="card-header">
                <a data-bs-toggle="collapse" href="#collapse-doTemp${tempDOCount}" aria-expanded="true" aria-controls="collapse-doTemp${tempDOCount}" id="heading-example" class="d-block text-center">
                    <i class="fa fa-chevron-down pull-right"></i>
                    Temperature / Dissolved Oxygen ${tempDOCount}
                </a>
            </div>
            <div id="collapse-doTemp${tempDOCount}" class="collapse show" aria-labelledby="heading-example">
                <div class="card-body">
                    <input class="form-control" value="?" type="hidden" id="doTemp_id" name="doTemp_id">
                    <div class="mb-3">
                        <label class='form-label' for="temperature">Temperature: </label>
                        <input type="number" inputmode="decimal" id="temperature" placeholder="Temperature Value" name="temperature" class="form-control" required>
                    </div>
                    <div class="mb-3">
                        <label class='form-label' for="dissolved_oxygen">Do Conc: </label>
                        <input type="number" min="0" inputmode="decimal" id="dissolved_oxygen" step="any" placeholder="Dissolved Oxygen" name="dissolved_oxygen" class="form-control" required>
                    </div>
                    <div class="form-inline">
                        <div class="mb-3">
                            <label class='form-label' for="doTempCoordinateX">X-Coordinate: </label>
                            <input type="number" inputmode="decimal" step="0.000001" id="doTempCoordinateX" placeholder="X" name="doTempCoordinateX" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label class='form-label' for="doTempCoordinateY">Y-Coordinate: </label>
                            <input type="number" inputmode="decimal" step="0.000001" id="doTempCoordinateY" placeholder="Y" name="doTempCoordinateY" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label class='form-label' for="doTempDepth">Depth: </label>
                            <input type="number" min="0" inputmode="decimal" step="0.01" id="doTempDepth" placeholder="Depth" name="doTempDepth" class="form-control" required>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `)
})

$("#addSecchi").click(function() { //Add a secchi card to the secchi container
    secchiCount = secchiCount + 1;
    $("#secchiDepth_Container").append(`
            <div class="card">
                <div class="card-header">
                    <a data-bs-toggle="collapse" href="#collapse-secchi${secchiCount}" aria-expanded="true" aria-controls="collapse-secchi${secchiCount}" id="heading-example" class="d-block text-center">
                        <i class="fa fa-chevron-down pull-right"></i>
                        Secchi ${secchiCount}
                    </a>
                </div>
                <div id="collapse-secchi${secchiCount}" class="collapse show" aria-labelledby="heading-example">
                    <div class="card-body text-left">
                        <input class="form-control" value="?" type="hidden" id="secchi_id" name="secchi_id">
                        <div class="mb-3">
                            <label class='form-label' for="secchi_depth">Secchi Depth: </label>
                            <input type="number" min="0" inputmode="decimal" step='any' id="secchi_depth" placeholder="Water Clarity" name="secchi_depth" class="form-control" required>
                        </div>
                        <div class="form-inline">
                            <div class="mb-3">
                                <label class='form-label' for="secchiCoordinateX">X-Coordinate: </label>
                                <input type="number" inputmode="decimal" step="0.000001" id="secchiCoordinateX" placeholder="X" name="secchiCoordinateX" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class='form-label' for="secchiCoordinateY">Y-Coordinate: </label>
                                <input type="number" inputmode="decimal" step="0.000001" id="secchiCoordinateY" placeholder="Y" name="secchiCoordinateY" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class='form-label' for="secchiDepth">Depth: </label>
                                <input type="number" min="0" inputmode="decimal" step="0.01" id="secchiDepth" placeholder="Depth" name="secchiDepth" class="form-control" required>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `)
})

$("#addPhosphorus").click(function() { //Add a phosphorus card to the phosphorus container
    phosphorusCount = phosphorusCount + 1;
    $("#phosphorus_Container").append(`
            <div class="card">
                <div class="card-header">
                    <a data-bs-toggle="collapse" href="#collapse-phosphorus${phosphorusCount}" aria-expanded="true" aria-controls="collapse-phosphorus${phosphorusCount}" id="heading-example" class="d-block text-center">
                        <i class="fa fa-chevron-down pull-right"></i>
                        Phosphorus ${phosphorusCount}
                    </a>
                </div>
                <div id="collapse-phosphorus${phosphorusCount}" class="collapse show" aria-labelledby="heading-example">
                    <div class="card-body">
                        <input class="form-control" value="?" type="hidden" id="phosphorus_id" name="phosphorus_id">
                        <div class="mb-3">
                            <label class='form-label' for="phosphorus">Phosphorus: </label>
                            <input type="number" min="0" inputmode="decimal" step="any" id="phosphorus" placeholder="Phosphorus in PPM" name="phosphorus" class="form-control" required>
                        </div>
                        <div class="form-inline">
                            <div class="mb-3">
                                <label class='form-label' for="phosphorusCoordinateX">X-Coordinate: </label>
                                <input type="number" inputmode="decimal" step="0.000001" id="phosphorusCoordinateX" placeholder="X" name="phosphorusCoordinateX" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class='form-label' for="phosphorusCoordinateY">Y-Coordinate: </label>
                                <input type="number" inputmode="decimal" step="0.000001" id="phosphorusCoordinateY" placeholder="Y" name="phosphorusCoordinateY" class="form-control" required>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `)
})

$("#addCalcium").click(function() { //Add a calcium card to the calcium container
    calciumCount = calciumCount + 1;
    $("#calcium_Container").append(`
            <div class="card">
                <div class="card-header">
                    <a data-bs-toggle="collapse" href="#collapse-calcium${calciumCount}" aria-expanded="true" aria-controls="collapse-calcium${calciumCount}" id="heading-example" class="d-block text-center">
                        <i class="fa fa-chevron-down pull-right"></i>
                        Calcium ${calciumCount}
                    </a>
                </div>
                <div id="collapse-calcium${calciumCount}" class="collapse show" aria-labelledby="heading-example">
                    <div class="card-body">
                        <input class="form-control" value="?" type="hidden" id="calcium_id" name="calcium_id">
                        <div class="mb-3">
                            <label class='form-label' for="calcium">Calcium: </label>
                            <input type="number" min="0" inputmode="decimal" id="calcium" step='any' placeholder="Calcium in PPM" name="calcium" class="form-control" required>
                        </div>
                        <div class="form-inline">
                            <div class="mb-3">
                                <label class='form-label' for="calciumCoordinateX">X-Coordinate: </label>
                                <input type="number" inputmode="decimal" step="0.000001" id="calciumCoordinateX" placeholder="X" name="calciumCoordinateX" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class='form-label' for="calciumCoordinateY">Y-Coordinate: </label>
                                <input type="number" inputmode="decimal" step="0.000001" id="calciumCoordinateY" placeholder="Y" name="calciumCoordinateY" class="form-control" required>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `)
})

$("#delete_Item").click(function() {

});
