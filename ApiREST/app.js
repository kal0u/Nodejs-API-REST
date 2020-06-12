const express = require('express')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./assets/swagger.json');
const {checkAndChange } = require('./assets/functions')
const mysql = require('promise-mysql')
const bodyParser = require('body-parser')
const morgan = require('morgan')('dev')
const config = require('./assets/config.json')

mysql.createConnection({
    host: config.db.host,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password
}).then((db) => {
        console.log('Connected');

        const app = express()
        let MembersRouter = express.Router()
        let Members = require('./assets/classes/members-class')(db, config)
        app.use(morgan)
        app.use(config.rootAPI+'/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

        //Middleware functions are functions that have access to the req uest object (req), the response object (res), and the next function in the application’s request-response cycle.
        app.use(bodyParser.json())
        app.use(bodyParser.urlencoded({ extended: true }))

        MembersRouter.route('/:id')

            // Récupérer un membre
            .get(async (req, res) => {
                
                let member = await Members.getByID(req.params.id)
                res.json(checkAndChange(member))
            })


            //Supprimer un membre
            .delete(async (req, res) => {

                let delMember = await Members.delete(req.params.id)
                res.json(checkAndChange(delMember))
            })
            // Modifier un membre
            .put(async (req, res) => {
                let updateMember = await Members.update(req.params.id, req.body.name)
                res.json(checkAndChange(updateMember))
            })
        MembersRouter.route('/')
            //Récuperer tout les membres
            .get(async (req, res) => {
                let allMembers = await Members.getAll(req.query.max)
                res.json(checkAndChange(allMembers))
            })
            .post((req, res) => {
                let addMember = Members.add(req.body.name)
                res.json(checkAndChange(addMember))
            })


        app.use(config.rootAPI + 'members', MembersRouter)

        app.listen(config.port, () => console.log('Started on port ' + config.port))


    }).catch((err) => {
        console.log('Error during database connection')
        console.log(err.message)
    })
