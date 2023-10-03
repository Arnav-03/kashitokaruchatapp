import axios from 'axios';
import React from 'react'
import { useContext } from 'react';
import { useState } from 'react'
import { UserContext } from './UserContext';
const Register = () => {



    const { setusername: setLoggedInUsername, setid } = useContext(UserContext);

    const [username, setusername] = useState("");
    const [password, setpassword] = useState("");
    const [IsloginOrRegister, setIsloginOrRegister] = useState("register");



    async function handlesubmit(e) {
        e.preventDefault();
        const url = IsloginOrRegister === "register" ? 'register' : 'login';
        const { data } = await axios.post(`/${url}`, { username, password });
        setLoggedInUsername(username);
        setid(data.id);
    }
    return (
        <div className='bg-pink-100 h-screen p-0 m-0 flex items-center'>
            <form className='w-64 mx-auto' onSubmit={handlesubmit}>
                <input type='text' onChange={(e) => setusername(e.target.value)} placeholder='username' value={username}
                    className='block w-full p-2 mb-5' />
                <input type='password' onChange={(e) => setpassword(e.target.value)} placeholder='password' value={password}
                    className='block w-full p-2 mb-5' />
                <button className='bg-pink-500 text-white block w-full rounded p-2 mb-5'>
                    {(IsloginOrRegister == "register" ? "Register" : "Login")}
                </button>
                <div>

                    {IsloginOrRegister === "register" && (
                        <div> Already a member?
                            <button className='text-fuchsia-950 underline font-bold' onClick={()=> setIsloginOrRegister('login')}>
                                Login here
                            </button>
                        </div>
                )}
                       {IsloginOrRegister === "login" && (
                        <div> Don't have an account?
                            <button className='text-fuchsia-950 underline font-bold' onClick={()=>setIsloginOrRegister('register')}>
                                Register
                            </button>
                        </div>
                )}
                
               </div>
            </form>
        </div>
    )
}

export default Register
