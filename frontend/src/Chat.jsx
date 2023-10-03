import React, { useContext } from 'react'
import { useEffect, useState, useRef } from 'react';
import sendbtn from './assets/send.png';
import chatimg from './assets/chat.png';
import attach from './assets/attach.png';

import { UserContext } from './UserContext';
import Start from './Start';
import _ from 'lodash';
import axios from 'axios';

const Chat = () => {

    const [ws, setws] = useState(null);
    const [onlinePeople, setonlinePeople] = useState({});
    const [selectedUser, setselectedUser] = useState(null);
    const [newMessage, setnewMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const { username, id, setid, setusername } = useContext(UserContext);
    const [offlinePeople, setOfflinePeople] = useState({});



    const divUnderMEssage = useRef(null);

    useEffect(() => {
        connnectTOWs();
    }, [selectedUser]);

    function connnectTOWs() {
        const ws = new WebSocket('ws://localhost:4000');
        setws(ws);
        ws.addEventListener('message', handlemessage);
        ws.addEventListener('close', () => {
            setTimeout(() => {
                console.log('trying to reconnect');
                connnectTOWs();
            }, 1000);
        });
    }
    function showOnlinePeople(peopleArray) {
        const people = {};
        peopleArray.forEach(({ userId, username }) => {
            people[userId] = username;
        });
        setonlinePeople(people);
    }


    useEffect(() => {
        axios.get('/people').then(res => {
            const offlinePeopleArr = res.data
                .filter(p => p._id !== id)
                .filter(p => !Object.keys(onlinePeople).includes(p._id));
            const offlinePeople = {};
            offlinePeopleArr.forEach(p => {
                offlinePeople[p._id] = p;
            });
            setOfflinePeople(offlinePeople);
            console.log(offlinePeople);
        });
    }, [onlinePeople]);

    function handlemessage(e) {
        const messageData = JSON.parse(e.data);
        console.log({ e, messageData });

        if (typeof messageData === 'object' && 'online' in messageData) {
            showOnlinePeople(messageData.online);
        } else if ('text' in messageData) {
            console.log(messageData);/*
            const recieved = messageData.text;
            console.log(recieved);
            setMessages(prev => ([...prev, { text: recieved, isOur: false }])); */
/*             setMessages(prev => ([...prev, { text: messageData.text, isOur: false }]));
 */           if(messageData.sender=== selectedUser){
    setMessages(prev => ([...prev, { ...messageData, isOur: false }]));

 }

        }

    }


    function sendMessage(e, file = null) {
        if (e) e.preventDefault();
        console.log('sending');
        ws.send(JSON.stringify({

            recipient: selectedUser,
            text: newMessage,
            file,

        }));

        setnewMessage("");
        setMessages(prev => ([...prev, {
            text: newMessage,
            sender: id,
            recipient: selectedUser,
            _id: Date.now(),
            isOur: true
        }]));
        if (file) {
            axios.get('/messages/' + selectedUser).then(res => {
                setMessages(res.data);
            });
        }
        console.log(messages);

    }
    function sendfile(e) {
        const reader = new FileReader();
        reader.readAsDataURL(e.target.files[0]);
        reader.onload = () => {
            sendMessage(null, {
                name: e.target.files[0].name,
                data: reader.result,
            })
        }
    }
    useEffect(() => {

        const div = divUnderMEssage.current;
        if (div) {
            div.scrollIntoView({ behaviour: 'smooth' });
        }


    }, [messages]);

    useEffect(() => {
        if (selectedUser) {
            axios.get('/messages/' + selectedUser).then(res => {
                setMessages(res.data);
            });
        }


    }, [selectedUser]);



    const onlinePeopleExcludingUser = { ...onlinePeople };
    delete onlinePeopleExcludingUser[id];

    const messagesWithoutDupe = _.uniqBy(messages, '_id');

    function logout() {

        axios.post('/logout').then(() => {
            setws(null);
            setid(null);
            setusername(null);
        })
    }
    const textStyle = {

        fontFamily: "'Yellowtail', cursive"
    };


    return (

        <div className='flex h-screen'>
            <div className="bg-pink-100 w-1/3 h-full flex flex-col p-5 mb-10 ">

                <div className="text-center bg-pink-600 my-1 h-14 w-full p-3 rounded-lg text-white ">
                    <span style={textStyle} className=' mx-2 capitalize  text-pink-100 text-3xl tracking-[.15em]'>
                        {username}
                    </span>
                </div>

                <div className="flex flex-row bg-pink-400 h-16 rounded-lg text-white font-bold text-4xl   text-center items-center py-10 px-16 mb-0">
                    Chats {<img className='h-12 mt-2 mx-6' src={chatimg} />}</div>
                <div className="  overflow-y-auto  mm-5 h-full">
                    {Object.keys(onlinePeopleExcludingUser).map(userId => (
                        <div onClick={() => setselectedUser(userId)} key={userId}
                            className={`cursor-pointer flex flex-row over bg-pink-200  my-1.5 border-l-8 border-pink-700 h-14 rounded-lg text-pink-800 font-bold  justify-between px-2 py-3 text-xl text-start capitalize ${userId === selectedUser ? 'bg-rose-500 text-rose-100' : ''}`}>
                            <div className="bg-pink-900  h-9 w-9 rounded-full text-white px-1.5 py-0.5 mr-5 text-m text-center ">
                                {onlinePeople[userId][0]}
                            </div>
                            {onlinePeople[userId]}
                            <div className="text-white p-1  h-6  text-xs text-right bg-green-700 rounded-full ">online</div>

                        </div>
                    ))}
                    {/* Display offline users and handle selection */}
                    {Object.values(offlinePeople).map((user) => (
                        <div
                            onClick={() => setselectedUser(user._id)} // Handle offline user selection
                            key={user._id}
                            className={`cursor-pointer flex flex-row over bg-pink-200 my-1.5 border-l-8 border-pink-700 h-14 rounded-lg text-pink-800 font-bold  justify-between px-2 py-3 text-xl text-start capitalize ${user._id === selectedUser ? 'bg-rose-500 text-rose-100 border-l-0 border-b-4 border-pink-800' : ''}`}
                        >
                            <div className="bg-pink-900  h-9 w-9 rounded-full text-white px-2.5 py-0 mr-5 text-m text-center ">
                                {user.username[0]}
                            </div>
                            {user.username}
                            <div className="text-white p-1  h-6  text-xs text-right bg-gray-400 rounded-full ">offline</div>
                        </div>
                    ))}
                </div>
                <div className="p-1 mt-10 text-center  ">
                    <button onClick={logout}
                        className='bg-red-600  text-white font-bold p-2 rounded-lg'>Logout</button>
                </div>


            </div>
            <div className=" flex flex-col bg-pink-300 w-2/3 overflow-hidden">
                {!selectedUser && <Start />}

                {!!selectedUser &&
                    <div className="flex flex-col h-full  overflow-y-auto " >
                        <div className="flex-grow overflow-auto">
                            {
                                messagesWithoutDupe.map((message, index) => (
                                    <div key={message._id} // Use _id as the key
                                        className={(message.sender == id ? ' text-right' : 'text-left')}>
                                        <div className={
                                            'p-2 m-2  rounded-lg inline-block  ' + (message.sender === id ? 'bg-pink-900 text-white ' : 'bg-pink-200 text-pink-950')
                                        }
                                            key={index}>
                                            <div className="font-bold inline-block capitalize">
                                                {message.sender === id ? 'Me : ' : ((onlinePeople[message.sender] || offlinePeople[message.sender] || 'Unknown') + ' :')}
                                            </div>
                                            <div className="inline-block">
                                                {message.text} 
                                                {message.file && (
                                                    <div  className="underline cursor-pointer">
                                                        <a target='_blank' href={axios.defaults.baseURL + '/uploads/' + message.file}>
                                                        {message.file}</a>
                                                    </div>

                                                )}
                   
                                                
                                                </div>
                                        </div>
                                    </div>
                                ))

                            }
                            <div ref={divUnderMEssage}></div>


                        </div>

                        <form onSubmit={sendMessage} className="flex gap-2 mx-2">
                            <input
                                type="text"
                                placeholder="Type your message here"
                                value={newMessage}
                                onChange={(e) => setnewMessage(e.target.value)}
                                name=""
                                id=""
                                className="p-2 m-3 border-2 flex-grow rounded-lg outline-none border-pink-900"
                            />
                            <label  className="bg-pink-500 cursor-pointer p-2 px-1 mx-0 my-3 text-white rounded-lg">
                                <input type='file' className='hidden' onChange={sendfile}/>
                                <img className="h-7" src={attach} alt="Send" />
                            </label>
                            <button type='submit' className="bg-pink-600 p-2 px-3 m-3 text-white rounded-lg">
                                <img className="h-7" src={sendbtn} alt="Send" />
                            </button>
                        </form>
                    </div>

                }

                    </div>
        </div >
            )
}

            export default Chat
