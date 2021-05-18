
$("#addFish").click(function() { //Adds an aditional fish as a bootstrap card to the report
    fishCount = fishCount + 1;
    $("#fishes").append(`
        <div class="card">
            <div class="card-header">
                <a data-toggle="collapse" href="#collapse-${fishCount}" aria-expanded="true" aria-controls="collapse-${fishCount}" id="heading-example" class="d-block text-center">
                    <i class="fa fa-chevron-down pull-right"></i>
                    Fish ${fishCount + 1}
                </a>
            </div>
            <div id="collapse-${fishCount}" class="collapse show" aria-labelledby="heading-example">
                <div class="card-body text-left">
                    <input class="form-control" value="?" type="hidden" id="fish_id" name="fish_id">
                    <div class="form-group d-flex flex-column">
                        <label class="form-label" for="photo">Picture of Fish: </label>
                        <input class="form-control-file" type="file" id="fish[${fishCount}][photo]" name="photo">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="species">Species: </label>
                        <select class="form-control custom-select" autocomplete="on" id="fish[${fishCount}][species]" placeholder="Species of Fish" name="species" required>
                            <option value="">Choose Fish...</option>
                            <option value="Atlantic Salmon">Atlantic Salmon</option>
                            <option value="Black Crappie">Black Crappie</option>
                            <option value="Bluegill">Bluegill</option>
                            <option value="Bowfin">Bowfin</option>
                            <option value="Brook Trout">Brook Trout</option>
                            <option value="Brown Bullhead">Brown Bullhead</option>
                            <option value="Brown Trout (Great Lakes)">Brown Trout (Great Lakes)</option>
                            <option value="Brown Trout (Inland)">Brown Trout (Inland)</option>
                            <option value="Burbot">Burbot</option>
                            <option value="Carp">Carp</option>
                            <option value="Channel Catfish">Channel Catfish</option>
                            <option value="Chinook Salmon">Chinook Salmon</option>
                            <option value="Cisco">Cisco</option>
                            <option value="Coho Salmon">Coho Salmon</option>
                            <option value="Freshwater Drum">Freshwater Drum</option>
                            <option value="Goldeye">Goldeye</option>
                            <option value="Lake Trout">Lake Trout</option>
                            <option value="Lake Whitefish">Lake Whitefish</option>
                            <option value="Largemouth Bass">Largemouth Bass</option>
                            <option value="Mooneye">Mooneye</option>
                            <option value="Muskellunge">Muskellunge</option>
                            <option value="Northern Pike">Northern Pike</option>
                            <option value="Pink Salmon">Pink Salmon</option>
                            <option value="Pumpkinseed">Pumpkinseed</option>
                            <option value="Rainbow Smelt">Rainbow Smelt</option>
                            <option value="Rainbow Trout (Great Lakes)">Rainbow Trout (Great Lakes)</option>
                            <option value="Rainbow Trout (Inland)">Rainbow Trout (Inland)</option>
                            <option value="Rock Bass">Rock Bass</option>
                            <option value="Sauger">Sauger</option>
                            <option value="Smallmouth Bass">Smallmouth Bass</option>
                            <option value="Sturgeon">Sturgeon</option>
                            <option value="Walleye">Walleye</option>
                            <option value="White Bass">White Bass</option>
                            <option value="White Crappie">White Crappie</option>
                            <option value="White Perch">White Perch</option>
                            <option value="White Sucker">White Sucker</option>
                            <option value="Yellow Perch">Yellow Perch</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="length">Length: </label>
                        <input class="form-control" type="number" inputmode="decimal" id="fish[${fishCount}][length]" placeholder="Length of Fish" name="length">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="weight">Weight: </label>
                        <input class="form-control" type="number" inputmode="decimal" id="fish[${fishCount}][weight]" placeholder="Weight of Fish" name="weight">
                    </div>
                </div>
            </div>
        </div>
    `)
})
