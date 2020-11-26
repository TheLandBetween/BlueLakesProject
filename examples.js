// BASIC ROUTES

app.post('/cats', (req, res) => {
    res.send("Cat post request")
});
// /cats => 'meow'
app.get('/cats', (req, res) => {
    res.send('meow');
});
// /dogs => 'woof'
app.get('/dogs', (req, res) => {
    res.send('woof');
});

// MORE ADVANCED

//example using query strings, pass in ?subreddit=searchedSubreddit
app.get('/search', (req, res) => {
    const {subreddit} = req.query;
    res.send(`<h1>Search results for: ${subreddit}`);
});

// generic pattern => /r/SOMETHINGHERE
app.get('/r/:subreddit', (req, res) => {
    // strip the parameters passed in with subreddit title
    const { subreddit } = req.params;
    // send it back, have to use tilda key dashes
    res.send(`<h1>Browsing the ${subreddit} subreddit </h1>`);
});

app.get('/r/:subreddit/:postId', (req, res) => {
    // strip the parameters
    const { subreddit, postId } = req.params;
    // send it back, have to use tilda key dashes
    res.send(`<h1>Viewing Post ID: ${postId} on the ${subreddit} subreddit </h1>`);
});

// random template example
// sends you  to rand.ejs and generates a random number between 0 and 1
app.get('/rand', (req, res) => {
    // want to keep as much js out of the templates as possible
    // do the math in here and pass in the variable
    const num =  Math.floor(Math.random() * 10) + 1;
    // pass in the variable num into the template as "num"
    res.render('random', { num });
});

// subreddit template example
app.get('/r/:subreddit', (req, res) => {
    // save subreddit params to subreddit variable
    const { subreddit } = req.params;
    // pass subreddit variable into subreddit.ejs template
    res.render('subreddit', { subreddit });
});

app.get('/cats', (req, res) => {
    const cats = [
        'Blue', 'Rocket', 'Monty', 'Doc'
    ];
    res.render('cats', { cats })
});
