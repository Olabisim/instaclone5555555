const express = require('express'),
        app = express(),
        port = process.env.PORT || 5000,
        mongoose = require('mongoose'),
        {MONGOURI} = require('./config/keys');




mongoose.connect(MONGOURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

mongoose.connection.on("connected", () => {
    console.log("connected to the mongodb yeah")
})

mongoose.connection.on("error", (err) => {
    console.log("connection failed", err)
})



require('./models/user');
require('./models/post')

app.use(express.json())

app.use(require('./routes/auth'))
app.use(require('./routes/post'))
app.use(require('./routes/user'))

//common name: olabisi
//ja1KBYOxSwyiLZ2Z


if(process.env.NODE_ENV == "production"){
    app.use(express.static('client/build'))
    const path = require('path')
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
}


app.listen(port, () => {
    console.log('server is listening on port http://localhost:' + port)
})