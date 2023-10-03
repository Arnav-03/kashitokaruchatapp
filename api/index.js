const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require('cors')
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const ws = require("ws");
const Message = require('./models/Message');
const User = require('./models/User');
const fs = require('fs');


dotenv.config();

mongoose.connect(process.env.MONGO_URL);

const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);
/* console.log(process.env.JWT_SECRET);
 */
const app = express();

app.use('/uploads',express.static(__dirname+'/uploads/'));

const corsOptions = {
    credentials: true,
    origin: "http://localhost:5173",
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

async function getUserDataFromRequest(req) {
    return new Promise((resolve, reject) => {
        const token = req.cookies?.token;
        if (token) {
            jwt.verify(token, jwtSecret, {}, (err, userData) => {
                if (err) throw err;
                resolve(userData);
            });
        }else{
            reject('no token');
        }
    })

}

/* console.log(process.env.CLIENT_URL);
 */app.get('/test', (req, res) => {
    res.json('test hehhee');
});

app.get('/messages/:userId', async (req, res) => {
    const { userId } = req.params;
    const userData= await getUserDataFromRequest(req);
    const ourUSerId  = userData.userId;
    const messages= await Message.find({
        sender:{$in:[userId,ourUSerId]},
        recipient:{$in:[userId,ourUSerId]},
    }).sort({createdAt:1});
    res.json(messages);

});


app.get('/people', async (req,res)=>{
    const users = await User.find({},{'_id':1,'username':1});
    res.json(users);
})

app.get('/profile', (req, res) => {
    const token = req.cookies?.token;
    if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
            if (err) throw err;
            res.json(userData);
        });
    } else {
        res.status(401).json('no token');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const foundUser = await User.findOne({ username });
    if (foundUser) {
        const passOk = bcrypt.compareSync(password, foundUser.password);
        if (passOk) {
            jwt.sign({ userId: foundUser._id, username }, jwtSecret, {}, (err, token) => {
                res.cookie('token', token, { sameSite: 'none', secure: true }).json({
                    id: foundUser._id,
                })
            });
        }
    }
});


app.post('/logout', (req, res) => {
    
    res.cookie('token', '', { sameSite: 'none', secure: true }).json('logout');
});


app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
        const createdUser = await User.create({
            username: username,
            password: hashedPassword,
        });

        jwt.sign({ userId: createdUser._id, username }, jwtSecret, {}, (err, token) => {
            if (err) throw err;
            res.cookie('token', token, { sameSite: 'none', secure: true }).status(201).json({
                id: createdUser._id,
            });
        })
    } catch (err) {
        if (err) throw err;
    }

});
const server = app.listen(4000);




const wss = new ws.WebSocketServer({ server });
wss.on('connection', (connection, req) => {

    function messageAboutOnlinePeople(){
        [...wss.clients].forEach(client => {
            client.send(JSON.stringify({
                online: [...wss.clients].map(c => ({ userId: c.userId, username: c.username }))
    
            }
            ));
        });
    
    }
/* 
    connection.isAlive = true;
    connection.timer = setInterval(()=>{
        connection.ping();

        connection.deathTimer = setTimeout(()=>{
            connection.isAlive = false;
            clearInterval(connection.timer);
            connection.terminate();
            messageAboutOnlinePeople();
      },500)

    },10000); */

    connection.on('pong',()=>{
/*         console.log('pong');
 */    });

    const cookies = req.headers.cookie;
    if (cookies) {
        const tokencookieString = cookies.split(';').find(str => str.startsWith('token='));
/*         console.log(tokencookieString);
 */        if (tokencookieString) {
            const token = tokencookieString.split('=')[1];
            if (token) {
                jwt.verify(token, jwtSecret, {}, (err, userData) => {
                    if (err) throw err;
/*                     console.log(userData);
 */                    const { userId, username } = userData;
                    connection.userId = userId;
                    connection.username = username;

                });
            }
        }
    }

    connection.on('message', async (message) => {
        const messageData = JSON.parse(message.toString());
/*         console.log(messageData);
 */        const { recipient, text,file } = messageData;
        let filename =null;
     
        if(file){
            const parts = file.name.split('.');
            const ext = parts[parts.length-1];
             filename = Date.now()+'.'+ext;
            const path = __dirname + '/uploads/' + filename;
            const bufferData = new Buffer(file.data.split(',')[1],'base64');
            fs.writeFile(path,bufferData, ()=>{
                console.log('file saved '+path);
            });
        }


        if (recipient && (text || file)) {
            const MessageDoc = await Message.create({
                sender: connection.userId,
                recipient,
                text,
                file:filename ,
    
            });
            [...wss.clients]
                .filter(c => c.userId === recipient)
                .forEach(c => c.send(JSON.stringify({
                    text,
                    sender: connection.userId,
                    recipient,
                    file:file ? filename : null,

                    _id: MessageDoc._id,
                })));
        }
    });


/*     console.log([...wss.clients].map(c => c.username));
 */    
/*     [...wss.clients].forEach(client => {
        client.send(JSON.stringify({
            online: [...wss.clients].map(c => ({ userId: c.userId, username: c.username }))

        }
        ));
    }); */

    messageAboutOnlinePeople();

});

wss.on('close',data=>{
    console.log('disconnect',data);
})
