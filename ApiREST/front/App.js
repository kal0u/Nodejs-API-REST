// Modules
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')('dev')
const axios = require('axios')
const twig = require('twig')

// Variables globales
const app = express()
const port = 8081
const fetch = axios.create({
    baseURL: 'http://localhost:8080/api/v1'

});


// Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan)

// Routes

// Page d'accueil
app.get('/', (req, res) => {
    res.redirect('/members')

})

// Page récupérant tous les membres.
app.get('/members', (req, res) => {
    apiCall(req.query.max ? '/members?max=' + req.query.max : '/members','get', {}, res, (result) => {
        res.render('members.twig', {
            members: result
        })
    })
})

//Page récupérant un membre en fonction de son ID

app.get('/members/:id', (req, res) => {
    apiCall('/members/' + req.params.id,'get', {}, res, (result) => {
        res.render('member.twig', {
            member: result
        })
    })
})

// Update un membre en fonction de son ID

app.get('/edit/:id', (req, res) => {
    apiCall('/members/' + req.params.id, 'get', {}, res, (result) => {
        res.render('edit.twig', {
            member: result
        })
    })
})

// Methode de modif

app.post('/edit/:id', (req, res) => {
    apiCall('/members/'+ req.params.id, 'put', {
        name: req.body.name
    }, res, () => {
        res.redirect('/members')
    })

})
// Methode de suppression de membre
app.post('/delete', (req, res) => {
    apiCall('/members/'+req.body.id, 'delete', {}, res, () => {
        res.redirect('/members')
    })
})

// Page d'ajout d'un membre

app.get ('/insert', (req, res) => {
    res.render('insert.twig')
})
// Methode d'ajout de membre
app.post('/insert', (req, res) => {
    apiCall('/members', 'post', {name : req.body.name}, res, () => {
        res.redirect('/members')
    })
})

// Lancemement de l'App
app.listen(port, () => console.log('Started on port ' + port))

// Fonctions 


function renderError(res, errMsg) {
    res.render('errors.twig', {
        errorMsg: errMsg
    })
}

function apiCall(url, method, data, res, next) {
    fetch({
        method: method,
        url: url,
        data: data
    }).then((response) => {
        if (response.data.status == 'success') {
            next(response.data.result)
        } else {
            renderError(res, response.data.message)
        }
    })
        .catch((err) => renderError(res, err.message))


}